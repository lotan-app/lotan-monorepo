import { Edge } from 'src/databases/mongodb/models/Edge';
import { ErrorCode } from 'src/errors/ErrorCode';
import { EdgeDeployState } from 'src/libs/enums/EdgeDeployState';
import { env } from 'src/libs/env';
import { ApiGatewayRepository } from 'src/repositories/ApiGatewayRepository';
import { DockerRepository } from 'src/repositories/DockerRepository';
import { EdgeRepository } from 'src/repositories/EdgeRepository';
import { Service } from 'typedi';

@Service()
export class EdgeService {
  constructor(
    private readonly edgeRepo: EdgeRepository,
    private readonly dockerRepo: DockerRepository,
    private readonly apiGatewayRepo: ApiGatewayRepository,
  ) {}

  async runEdge(edgeId: string): Promise<{
    error: {
      code: string;
      message: string;
    };
    data: {
      containerId: string;
      containerName: string;
    };
  }> {
    const edge = await this.edgeRepo.getEdgeById(edgeId);

    if (!edge) {
      return {
        error: {
          code: ErrorCode.EDGE_NOT_FOUND,
          message: 'Edge not found',
        },
        data: null,
      };
    }

    const { subgraphUrl, port, limitCpu, limitMem } = edge;

    const { error, data } = await this.dockerRepo.runEdge({
      edgeId: edge.id,
      agentUrl: env.agentUrl,
      subgraphUrl,
      backupDbUrl: edge.backupDbUrl,
      exposePort: port,
      limitCpu,
      limitMem,
    });

    if (error) {
      await this.edgeRepo.updateEdgeById({ id: edgeId, errorLogs: error.message });

      return {
        error,
        data: null,
      };
    }

    await this.edgeRepo.updateEdgeById({
      id: edgeId,
      containerId: data.containerId,
      containerName: data.containerName,
      deployState: EdgeDeployState.DEPLOYED,
    });

    const edgeDials = [`${env.agentIp}:${port}`];

    const newDeployVersion = `v${edge.deployVersion}`;
    const { path } = await this.apiGatewayRepo.registerApiGateway(edge.subgraphId, newDeployVersion, edgeDials);

    await this.edgeRepo.updateEdgeById({ id: edgeId, apiPath: path });

    return {
      error: null,
      data,
    };
  }

  async syncEdgeStates() {
    const edges = await this.edgeRepo.getAllEdges();

    await Promise.all(edges.map(edge => this.syncEdgeState(edge)));
  }

  private async syncEdgeState(edge: Edge) {
    if (!edge.containerId) {
      return;
    }

    const { error, data: dockerEdgeInfo } = await this.dockerRepo.getEdgeInfo(edge.containerId);

    if (error) {
      await this.edgeRepo.updateEdgeById({ id: edge.id, errorLogs: error.message });
      return;
    }

    // if (dockerEdgeInfo.state.status !== EdgeStatus.RUNNING && dockerEdgeInfo.state.status === edge.state.status) {
    //     return
    // }

    let logsString = '';

    const logsData = await this.dockerRepo.getLogs(edge.containerId);

    if (logsData.error) {
      logsString = logsData.error.message;
    } else {
      logsString = logsData.data.logs;
    }

    await this.edgeRepo.updateEdgeById({
      id: edge.id,
      containerId: dockerEdgeInfo.containerId,
      containerName: dockerEdgeInfo.containerName,
      state: {
        ...dockerEdgeInfo.state,
      },
      logs: logsString,
      errorLogs: dockerEdgeInfo.state.running ? '' : undefined,
    });
  }

  async updateBackupUrl(edgeId: string, backupDbUrl: string) {
    await this.edgeRepo.updateEdgeById({ id: edgeId, backupDbUrl });
  }
}

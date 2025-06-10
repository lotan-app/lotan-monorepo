import { BusinessLogicError } from 'src/errors/BusinessLogicError';
import { ErrorCode } from 'src/errors/ErrorCode';
import { genId } from 'src/libs/utils/genId';
import { Service } from 'typedi';
import { Agent } from '../databases/mongodb/models/Agent';
import { Logger } from '../decorators/Logger';
import { env } from '../libs/env';
import { ILogger } from '../libs/types/ILogger';
import { AgentRepository } from '../repositories/AgentRepository';
import { EdgeRepository } from '../repositories/EdgeRepository';
import { SubgraphRepository } from '../repositories/SubgraphRepository';
import { RemoteAgentService } from './RemoteAgentService';
import { EdgeDeployState } from 'src/libs/enums/EdgeDeployState';

@Service()
export class DeployService {
  constructor(
    @Logger(module.filename) private readonly logger: ILogger,
    private readonly agentRepo: AgentRepository,
    private readonly edgeRepo: EdgeRepository,
    private readonly remoteAgentService: RemoteAgentService,
    private readonly subgraphRepo: SubgraphRepository,
  ) {}

  async deployEdge(data: {
    subgraphApiKey: string;
    subgraphUrl: string;
  }): Promise<{ containerId: string; containerName: string }> {
    // check subgraphId exists
    const subgraph = await this.subgraphRepo.getSubgraphByApiKey(data.subgraphApiKey);

    if (!subgraph) {
      throw new BusinessLogicError(ErrorCode.SUBGRAPH_NOT_FOUND);
    }

    // get latest deploy version
    const latestDeployVersion = await this.getDeployVersion(subgraph.id);

    // init edge
    const edge = await this.edgeRepo.createEdge({
      id: genId(),
      subgraphId: subgraph.id,
      subgraphUrl: data.subgraphUrl,
      deployState: EdgeDeployState.PENDING,
      containerId: '',
      containerName: '',
      agentId: '',
      deployVersion: latestDeployVersion + 1,
      apiPath: '',
      port: null,
      logs: '',
      state: {
        dead: false,
        paused: false,
        restarting: false,
        running: false,
        status: '',
      },
      limitCpu: env.edgeConfig.limitCpu,
      limitMem: env.edgeConfig.limitMem,
      errorLogs: '',
    });

    // get agent
    const agent = await this.selectAgent();

    if (!agent) {
      await this.edgeRepo.updateEdgeById({
        id: edge.id,
        errorLogs: 'No agent available',
      });

      return null;
    }

    // get port for edge
    const port = await this.getPort(agent.id);

    if (!port) {
      await this.edgeRepo.updateEdgeById({
        id: edge.id,
        errorLogs: `Agent ${agent.id} port full`,
      });

      return null;
    }

    // update edge

    await this.edgeRepo.updateEdgeById({
      id: edge.id,
      agentId: agent.id,
      port,
      deployState: EdgeDeployState.DEPLOYING,
    });

    const response = await this.remoteAgentService.deployEdge(agent.url, { edgeId: edge.id });

    if (response.error) {
      await this.edgeRepo.updateEdgeById({
        id: edge.id,
        errorLogs: response.error.message,
        deployState: EdgeDeployState.DEPLOY_FAILURE,
      });

      return null;
    }

    // register domain

    await this.edgeRepo.updateEdgeById({
      id: edge.id,
      containerId: response.data.containerId,
      containerName: response.data.containerName,
    });

    return {
      containerId: response.data.containerId,
      containerName: response.data.containerName,
    };
  }

  private async getDeployVersion(subgraphId: string): Promise<number> {
    const latestDeployVersion = await this.edgeRepo.getLatestVersionEdgeBySubgraphId(subgraphId);

    return latestDeployVersion ? latestDeployVersion.deployVersion : 0;
  }

  private async selectAgent(): Promise<Agent> {
    const agents = await this.agentRepo.getAllAgents();

    let agentIsSelected: Agent | null = null;

    // select a agent
    for (const agent of agents) {
      // check agent online

      if (Date.now() - agent.latestPing > env.periodPingMs) {
        continue;
      }

      // check agent mem usage
      if (agent.memUsage / agent.totalMem > 0.8) {
        continue;
      }

      agentIsSelected = agent;
      break;
    }

    return agentIsSelected;
  }

  private async getPort(agentId: string): Promise<number> {
    const alreadyPorts = await this.edgeRepo.getAllPortByAgent(agentId);

    const startPort = env.edgeConfig.portRange.start;
    const endPort = env.edgeConfig.portRange.end;

    for (let i = startPort; i < endPort; i++) {
      if (!alreadyPorts.includes(i)) {
        return i;
      }
    }

    return null;
  }
}

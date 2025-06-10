import { Docker } from 'docker-cli-js';
import { nanoid } from 'nanoid';
import { ErrorCode } from 'src/errors/ErrorCode';
import { EDGE_NAME_PREFIX } from 'src/libs/constants';
import { env } from 'src/libs/env';
import { executePromise } from 'src/libs/utils/executePromise';
import { Service } from 'typedi';

@Service()
export class DockerRepository {
  private docker = new Docker({
    echo: false,
  });

  private async loginDocker() {
    if (!env.docker.username || !env.docker.password || !env.docker.registry) {
      return;
    }

    await this.docker.command(`login -u ${env.docker.username} -p ${env.docker.password} ${env.docker.registry}`);
  }

  async runEdge(config: {
    edgeId: string;
    agentUrl: string;
    subgraphUrl: string;
    backupDbUrl: string;
    exposePort: number;
    limitCpu: string;
    limitMem: string;
  }): Promise<{ error?: { code: string; message: string }; data?: { containerId: string; containerName: string } }> {
    const { edgeId, subgraphUrl, agentUrl, exposePort, backupDbUrl = '' } = config;

    const [loginError] = await executePromise(this.loginDocker());

    if (loginError) {
      return {
        error: { code: ErrorCode.DOCKER_LOGIN_FAILED, message: loginError.message },
      };
    }

    const containerName = `${EDGE_NAME_PREFIX}-${nanoid()}`;

    // const command = `run -d -p ${exposePort}:8080 --name "${containerName}" --env SUBGRAPH_URL=${subgraphUrl} --env BE_HOST=${env.graphBe.host} --env SYSTEM_ACCESS_TOKEN=${env.systemAccessToken} --cpus="${limitCpu}" --memory="${limitMem}" ${env.graphEdgeImage}`

    const command = `run -d -p ${exposePort}:8080 --name "${containerName}" --env EDGE_ID=${edgeId} --env AGENT_URL=${agentUrl} --env BACKUP_DB_URL=${backupDbUrl} --env SUBGRAPH_URL=${subgraphUrl} --env BE_URL=${env.beUrl} --env SYSTEM_ACCESS_TOKEN=${env.systemAccessToken} ${env.graphEdgeImage}`;

    const [runError, commandResult] = await executePromise(this.docker.command(command));

    if (runError) {
      return {
        error: { code: ErrorCode.DOCKER_RUN_FAILED, message: runError.message },
      };
    }

    return {
      data: {
        containerId: commandResult.containerId,
        containerName,
      },
    };
  }

  async getEdgeInfo(
    containerId: string,
  ): Promise<{
    error?: { code: string; message: string };
    data?: {
      containerId: string;
      image: string;
      containerName: string;
      state: { status: string; running: boolean; paused: boolean; restarting: boolean; dead: boolean };
    };
  }> {
    const [error, commandResult] = await executePromise(this.docker.command(`inspect ${containerId}`));

    if (error) {
      return {
        error: {
          code: ErrorCode.DOCKER_INSPECT_FAILED,
          message: error.message,
        },
      };
    }

    const object = commandResult.object[0];

    return {
      data: {
        containerId: object.Id,
        image: object.Image,
        containerName: object.Name,
        state: {
          status: object.State.Status,
          running: object.State.Running,
          paused: object.State.Paused,
          restarting: object.State.Restarting,
          dead: object.State.Dead,
        },
      },
    };
  }

  async getLogs(containerId: string): Promise<{ error?: { code: string; message: string }; data?: { logs: string } }> {
    const [error, commandResult] = await executePromise(this.docker.command(`logs --tail 50 ${containerId}`));

    if (error) {
      return {
        error: {
          code: ErrorCode.DOCKER_LOGS_FAILED,
          message: error.message,
        },
      };
    }

    return {
      data: {
        logs: commandResult.raw,
      },
    };
  }
}

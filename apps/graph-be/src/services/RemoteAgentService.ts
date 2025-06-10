import { Service } from 'typedi';
import { BusinessLogicError } from '../errors/BusinessLogicError';
import { ErrorCode } from '../errors/ErrorCode';
import { env } from 'src/libs/env';

@Service()
export class RemoteAgentService {
  private async fetchAgent(host: string, path: string, body: any) {
    const res = await fetch(`${host}${path}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.systemAccessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new BusinessLogicError(ErrorCode.FETCH_TO_AGENT_FAILED);
    }

    const data = await res.json();

    return data;
  }

  async deployEdge(
    url: string,
    body: {
      edgeId: string;
    },
  ): Promise<{
    error: {
      code: string;
      message: string;
    };
    data: {
      containerId: string;
      containerName: string;
    };
  }> {
    const data = await this.fetchAgent(url, '/edge/deploy', body);

    return data;
  }
}

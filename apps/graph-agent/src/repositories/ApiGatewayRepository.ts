import axios from 'axios';
import { env } from 'src/libs/env';
import { Service } from 'typedi';
@Service()
export class ApiGatewayRepository {
  private async fetchApi(
    url: string,
    options: {
      method: 'POST' | 'GET' | 'PATCH';
      body?: string;
    },
  ) {
    const { method, body } = options;

    const res = await axios.request({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${env.candy.secret}`,
      },
      data: body,
    });

    return res.data;
  }

  private getId(subgraphId: string, deployVersion: string): string {
    return `${subgraphId}-${deployVersion}`;
  }

  private getPath(subgraphId: string, deployVersion: string): string {
    return `/${subgraphId}/${deployVersion}`;
  }

  async registerApiGateway(subgraphId: string, deployVersion: string, edgeDials: string[]): Promise<{ path: string }> {
    const url = `${env.candy.url}/config/apps/http/servers/srv0/routes`;
    const path = this.getPath(subgraphId, deployVersion);
    const payload = {
      '@id': this.getId(subgraphId, deployVersion),
      match: [{ path: [`${path}*`] }],
      handle: [
        {
          handler: 'reverse_proxy',
          load_balancing: { selection_policy: { policy: 'round_robin' } },
          health_checks: { active: { uri: '/health' } },
          upstreams: edgeDials.map(edgeDial => ({ dial: edgeDial })),
        },
      ],
    };

    await this.fetchApi(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return { path };
  }

  async getConfigById(subgraphId: string) {
    const url = `${env.candy.url}/id/${subgraphId}`;

    const data = await this.fetchApi(url, { method: 'GET' });

    return data;
  }

  async updateUpstreams(subgraphId: string, deployVersion: string, edgeDials: string[]) {
    const url = `${env.candy.url}/id/${this.getId(subgraphId, deployVersion)}/handle/0/upstreams`;
    const payload = edgeDials.map(dial => ({ dial }));

    const data = await this.fetchApi(url, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    return data;
  }
}

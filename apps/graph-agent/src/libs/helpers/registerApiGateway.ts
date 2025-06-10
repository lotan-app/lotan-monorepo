import { env } from '../env';

export const registerApiGateway = async (
  subgraphId: string,
  services: string[],
): Promise<{
  subgraphDomain: string;
}> => {
  const payload = {
    '@id': subgraphId,
    match: [
      {
        path: [`/${subgraphId}*`],
      },
    ],
    handle: [
      {
        handler: 'reverse_proxy',
        load_balancing: {
          selection_policy: {
            policy: 'round_robin',
          },
        },
        health_checks: {
          active: {
            uri: '/health',
          },
        },
        upstreams: services.map(service => ({
          dial: service,
        })),
      },
    ],
  };

  const res = await fetch(env.traefik.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${env.traefik.secret}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to register subgraph ${subgraphId} with services ${services.join(', ')}`);
  }

  return {
    subgraphDomain: 'subgraphDomain',
  };
};

import { graphBeApi } from '../constant';

export const deployEdge = async (
  subgraphUrl: string,
  apiKey: string,
): Promise<{ status: string; subgraphUrl: string }> => {
  const res = await fetch(graphBeApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subgraphApiKey: apiKey, subgraphUrl }),
  });

  if (!res.ok) {
    throw new Error(`Failed to deploy edge: ${res.statusText}`);
  }

  const data = await res.json();

  return data as { status: string; subgraphUrl: string };
};

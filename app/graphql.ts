import { GraphQLResponse } from '@/types/game';

const GRAPHQL_ENDPOINT = 'https://gateway.thegraph.com/api/subgraphs/id/FFz8eoWmY2G8ntMnhHZqeAu71CEpstm7wVZbhyMh7GNa';

const BLOCKS_QUERY = `
  {
    blocks(first: 100, orderBy: timestamp, orderDirection: desc) {
      timestamp
      gasUsed
      size
    }
  }
`;

export async function fetchKatanaBlocks(): Promise<GraphQLResponse> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer a8f71950ae2eb31731ad9ff720a9b866',
      },
      body: JSON.stringify({
        query: BLOCKS_QUERY,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch blocks');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Katana blocks:', error);
    throw error;
  }
}
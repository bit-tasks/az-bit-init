const GRAPHQL_ENDPOINT = 'https://api.v2.bit.cloud/graphql';

export const archiveLane = (id: string, token: string) => {
  const query = `
    mutation DELETE_LANE($id: String!) {
      deleteLane(id: $id)
    }
  `;

  const variables = { id };

  return fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  }).then(response => response.json());
};
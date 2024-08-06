import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  NormalizedCacheObject,
  Observable,
  from,
} from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { onError } from "@apollo/client/link/error";
import { getRefreshToken } from "@App/services/auth/authService";
// const httpLink: any = createUploadLink({
//   uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
// });

// todo: implement batch query, but need handle error success fully
const httpLink = new BatchHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  batchInterval: 20,
  batchMax: 10,
});

const authLink = new ApolloLink((operation, forward) => {
  const context = operation.getContext();
  const requiredAuth = context?.requiredAuth;
  const account = context?.account;
  const auth = localStorage.getItem(`auth-${account}`);
  const token = auth ? `Bearer ${JSON.parse(auth).accessToken}` : "";
  operation.setContext({
    headers: {
      Authorization: requiredAuth ? token : "",
    },
  });

  return forward(operation);
});
const link = onError(({ networkError, operation, forward }) => {
  if (networkError && (networkError as any).statusCode === 401) {
    const context = operation.getContext();
    const account = context?.account;
    const auth = localStorage.getItem(`auth-${account}`);
    const refresh = auth ? JSON.parse(auth).refreshToken : "";
    if (!refresh) return;
    return new Observable((observer) => {
      getRefreshToken(refresh)
        .then((response) => {
          const { accessToken, refreshToken } = response.data.refreshToken;
          localStorage.setItem(
            `auth-${account}`,
            JSON.stringify({
              accessToken,
              refreshToken,
            })
          );
          operation.setContext({
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          });
          forward(operation).subscribe(observer);
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  return forward ? forward(operation) : null;
});

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: from([authLink, link, httpLink]),
  cache: new InMemoryCache(),
});

export default client;

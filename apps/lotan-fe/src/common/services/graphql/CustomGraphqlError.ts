import { GraphQLFormattedError } from "graphql";

export default class CustomGraphqlError extends Error {
  constructor(
    message: string,
    public graphQLErrors: ReadonlyArray<GraphQLFormattedError>
  ) {
    super(message);
  }
}

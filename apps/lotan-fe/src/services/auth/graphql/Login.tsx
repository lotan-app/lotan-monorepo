import { gql } from "graphql-tag";

export const graphLogin = gql`
  mutation Login($address: String!, $signature: String!) {
    login(address: $address, signature: $signature) {
      accessToken
      refreshToken
    }
  }
`;

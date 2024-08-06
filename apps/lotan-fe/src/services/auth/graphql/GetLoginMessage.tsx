import { gql } from "graphql-tag";

export const graphLoginMessage = gql`
  query GetLoginMessage($address: String!) {
    getLoginMessage(address: $address)
  }
`;

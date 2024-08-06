import { gql } from "graphql-tag";

export const graphDeleteFile = gql`
  mutation DeleteUserFiles($ids: [String!]!) {
    deleteUserFiles(ids: $ids)
  }
`;

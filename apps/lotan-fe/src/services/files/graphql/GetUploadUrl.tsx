import { gql } from "graphql-tag";

export const graphUploadUrl = gql`
  query GetUploadUrl {
    getUploadUrl {
      url
      fileLimit
    }
  }
`;

import { gql } from "graphql-tag";

export const graphGetUserFiles = gql`
  query GetUserFiles(
    $size: Int
    $page: Int
    $txtSearch: String
    $startTime: Float
    $endTime: Float
  ) {
    getUserFiles(
      size: $size
      page: $page
      txtSearch: $txtSearch
      startTime: $startTime
      endTime: $endTime
    ) {
      total
      size
      page
      items {
        _id
        address
        blobID
        fileName
        createdAt
        updatedAt
        size
      }
    }
  }
`;

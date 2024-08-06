import { gql } from "graphql-tag";

export const graphCreateUploadFile = gql`
  mutation CreateUserFile($fileName: String!, $blobID: String!) {
    createUserFile(fileName: $fileName, blobID: $blobID) {
      _id
      address
      blobID
      fileName
      createdAt
      updatedAt
    }
  }
`;

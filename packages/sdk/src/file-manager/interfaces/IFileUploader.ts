export interface IFileUploader {
    uploadFileWithPassword(
      file: any,
      password: string,
      onProgress?: (uploaded: number, total: number) => void
    ): Promise<{
      jsonBlobId: string;
      jsonUrl: string;
      chunks: {
        url: string;
        blobId: string;
      }[];
    }>;
  
    uploadFileWithoutPassword(
      file: any,
      onProgress?: (uploaded: number, total: number) => void
    ): Promise<{
      jsonBlobId: string;
      jsonUrl: string;
      chunks: {
        url: string;
        blobId: string;
      }[];
    }>;
  }
  
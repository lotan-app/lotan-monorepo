
import { IFileUploader } from "./IFileUploader";

export interface IFileUploaderWeb extends IFileUploader {
    uploadFileWithPassword(file: File,
        password: string): Promise<{
        jsonBlobId: string; 
        jsonUrl: string; 
        chunks: { 
            url: string, 
            blobId: string 
        }[];
    }>;
    uploadFileWithoutPassword(file: File
    ): Promise<{
        jsonBlobId: string; 
        jsonUrl: string; 
        chunks: { 
            url: string, 
            blobId: string 
        }[];
    }>;
}
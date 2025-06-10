
import { IFileUploader } from "./IFileUploader";

export interface IFileUploaderNative extends IFileUploader {
    uploadFileWithPassword(file: string,
        password: string): Promise<{
        jsonBlobId: string; 
        jsonUrl: string; 
        chunks: { 
            url: string, 
            blobId: string 
        }[];
    }>;
    uploadFileWithoutPassword(file: string
    ): Promise<{
        jsonBlobId: string; 
        jsonUrl: string; 
        chunks: { 
            url: string, 
            blobId: string 
        }[];
    }>;
}
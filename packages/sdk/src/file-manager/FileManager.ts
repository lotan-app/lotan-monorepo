import { IFileDownloader } from './interfaces/IFileDownloader';
import { IFileUploader } from './interfaces/IFileUploader';

export class FileManager {
    
    constructor(private readonly fileUploader: IFileUploader | null, private readonly fileDownloader: IFileDownloader | null) { }

    async uploadFileWithPassword(file: File | string, password: string): Promise<{
        jsonBlobId: string; 
        jsonUrl: string; 
        chunks: { url: string, blobId: string }[];
    }> {
        if (!this.fileUploader) {
            throw new Error('File uploader not implemented');
        }

        const uploadResult = await this.fileUploader.uploadFileWithPassword(file, password);

        return {
            jsonBlobId: uploadResult.jsonBlobId,
            jsonUrl: uploadResult.jsonUrl,
            chunks: uploadResult.chunks,
        };
    }

    // Function upload without password
    async uploadFileWithoutPassword(file: File | string): Promise<{
        jsonBlobId: string; 
        jsonUrl: string; 
        chunks: { url: string, blobId: string }[];
    }> {
        if (!this.fileUploader) {
            throw new Error('File uploader not implemented');
        }

        const uploadResult = await this.fileUploader.uploadFileWithoutPassword(file);

        return {
            jsonBlobId: uploadResult.jsonBlobId,
            jsonUrl: uploadResult.jsonUrl,
            chunks: uploadResult.chunks,
        };
    }

    async downloadFileWithPassword(jsonUrl: string, password: string, destinationPath?: string ): Promise<void> {
        if (!this.fileDownloader) {
            throw new Error('File downloader not implemented');
        }

        return this.fileDownloader.downloadFileWithPassword(jsonUrl, password, destinationPath);
    }

    // Function download without password
    async downloadFileWithoutPassword(jsonUrl: string, destinationPath?: string ): Promise<void> {
        if (!this.fileDownloader) {
            throw new Error('File downloader not implemented');
        }

        return this.fileDownloader.downloadFileWithoutPassword(jsonUrl, destinationPath);
    }
}



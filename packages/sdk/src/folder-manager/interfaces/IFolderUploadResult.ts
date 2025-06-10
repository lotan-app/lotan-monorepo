export interface IFolderUploadResult {
    folderMetadata: any;
    folderBlobId: string;
    folderUrl: string;
    uploaded:{
        relativePath: string;
        jsonBlobId: string;
        jsonUrl: string;
    }[];
}

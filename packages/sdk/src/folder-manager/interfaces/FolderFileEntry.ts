export interface FolderFileEntry <T>{
    file: T;
    relativePath: string;
    jsonUrl?: string;
    jsonBlobId?: string;
}
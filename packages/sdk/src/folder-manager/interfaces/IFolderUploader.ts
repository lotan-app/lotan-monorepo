import { IFolderUploadResult } from './IFolderUploadResult';

export interface IFolderUploader {
  uploadFolderWithPassword(
    folderHandle: FileSystemDirectoryHandle | string,
    password: string
  ): Promise<IFolderUploadResult>;

  uploadFolderWithoutPassword(
    folderHandle: FileSystemDirectoryHandle | string
  ): Promise<IFolderUploadResult>;
}

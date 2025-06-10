export interface IFolderDownloader<T = string | FileSystemDirectoryHandle> {
  downloadFolderWithPassword(folderJsonUrl: string, password: string, destination: T): Promise<void>;
  downloadFolderWithoutPassword(folderJsonUrl: string, destination: T): Promise<void>;
}

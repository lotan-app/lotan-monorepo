export interface IPathAdapter<T> {
    createRootFolder(destination: T, folderName: string): Promise<T>;
    createFileHandle(root: T, relativePath: string): Promise<any>;
  }
  
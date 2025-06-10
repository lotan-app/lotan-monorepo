import { IPathAdapter } from "../interfaces/IPathAdapter";
export class WebPathAdapter implements IPathAdapter<FileSystemDirectoryHandle> {
    async createRootFolder(destination: FileSystemDirectoryHandle, folderName: string) {
      return await destination.getDirectoryHandle(folderName, { create: true });
    }
  
    async createFileHandle(root: FileSystemDirectoryHandle, relativePath: string) {
      const parts = relativePath.split('/');
      const fileName = parts.pop()!;
      let dir = root;
      for (const part of parts) {
        dir = await dir.getDirectoryHandle(part, { create: true });
      }
      return await dir.getFileHandle(fileName, { create: true });
    }
  }
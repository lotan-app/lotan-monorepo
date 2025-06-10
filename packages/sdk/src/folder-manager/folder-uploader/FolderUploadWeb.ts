import { BaseFolderUploader } from '../folder-uploader/BaseUploadFolder';
import { FolderFileEntry } from '../interfaces/FolderFileEntry';
import { IFolderUploadResult } from '../interfaces/IFolderUploadResult';
import { FileUploaderWeb } from '../../file-manager';
import { IndexedDBUploadResumeHandler } from '../resume/resume-upload/WebFolderUploadResumeHandler';

export class FolderUploaderWeb extends BaseFolderUploader<File> {
  constructor(
    uploader: FileUploaderWeb,
    password?: string,
  ) {
    super(uploader, new IndexedDBUploadResumeHandler(), password);
  }

  async uploadFolderWithPassword(folderHandle: FileSystemDirectoryHandle, password: string): Promise<IFolderUploadResult> {
    this.password = password;
    const folderName = folderHandle.name;
    return this.uploadFolderFromHandle(folderHandle, folderName);
  }

  async uploadFolderWithoutPassword(folderHandle: FileSystemDirectoryHandle): Promise<IFolderUploadResult> {
    this.password = undefined;
    const folderName = folderHandle.name;
    return this.uploadFolderFromHandle(folderHandle, folderName);
  }

  private async uploadFolderFromHandle(folderHandle: FileSystemDirectoryHandle, folderName: string): Promise<IFolderUploadResult> {
    const fileEntries: FolderFileEntry<File>[] = [];

    const walk = async (dirHandle: FileSystemDirectoryHandle, pathPrefix = '') => {
      for await (const [name, handle] of (dirHandle as any).entries()) {
        const currentPath = pathPrefix ? `${pathPrefix}/${name}` : name;

        if (handle.kind === 'file') {
          const file = await handle.getFile();
          fileEntries.push({ file, relativePath: currentPath });
        } else if (handle.kind === 'directory') {
          await walk(handle, currentPath);
        }
      }
    };

    await walk(folderHandle);
    return this.uploadFolderFiles(fileEntries, folderName);
  }

  async uploadFolderFilesWithProgress(
    folderHandle: FileSystemDirectoryHandle,
    onProgress: (relativePath: string, uploaded: number, total: number) => void
  ): Promise<IFolderUploadResult> {
    const folderName = folderHandle.name;
    const fileEntries: FolderFileEntry<File>[] = [];

    const walk = async (dirHandle: FileSystemDirectoryHandle, pathPrefix = '') => {
      for await (const [name, handle] of (dirHandle as any).entries()) {
        const currentPath = pathPrefix ? `${pathPrefix}/${name}` : name;

        if (handle.kind === 'file') {
          const file = await handle.getFile();
          fileEntries.push({ file, relativePath: currentPath });
        } else if (handle.kind === 'directory') {
          await walk(handle, currentPath);
        }
      }
    };

    await walk(folderHandle);

    const originalUploadWithPassword = this.uploader.uploadFileWithPassword.bind(this.uploader);
    const originalUploadWithoutPassword = this.uploader.uploadFileWithoutPassword.bind(this.uploader);

    (this.uploader as any).uploadFileWithPassword = async (file: File, password: string) => {
      return originalUploadWithPassword(file, password, (uploaded: number, total: number) => {
        const relativePath = this.uploader.getFileName(file);
        onProgress(relativePath, uploaded, total);
      });
    };

    (this.uploader as any).uploadFileWithoutPassword = async (file: File) => {
      return originalUploadWithoutPassword(file, (uploaded: number, total: number) => {
        const relativePath = this.uploader.getFileName(file);
        onProgress(relativePath, uploaded, total);
      });
    };

    return this.uploadFolderFiles(fileEntries, folderName);
  }
}


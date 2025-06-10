import { IFolderUploader } from './interfaces/IFolderUploader';
import { IFolderDownloader } from './interfaces/IFolderDownloader';
import { IFolderUploadResult } from './interfaces/IFolderUploadResult';

export class FolderManager {
  constructor(
    private readonly folderUploader: IFolderUploader | null,
    private readonly folderDownloader: IFolderDownloader | null
  ) {}

  async uploadFolderWithPassword(
    folderPath: string,
    password: string
  ): Promise<IFolderUploadResult> {
    if (!this.folderUploader) {
      throw new Error('Folder uploader not implemented');
    }
    return this.folderUploader.uploadFolderWithPassword(folderPath, password);
  }

  async uploadFolderWithoutPassword(folderPath: string): Promise<IFolderUploadResult> {
    if (!this.folderUploader) {
      throw new Error('Folder uploader not implemented');
    }
    return this.folderUploader.uploadFolderWithoutPassword(folderPath);
  }

  async downloadFolderWithPassword(
    folderJsonUrl: string,
    password: string,
    destinationPath: string
  ): Promise<void> {
    if (!this.folderDownloader) {
      throw new Error('Folder downloader not implemented');
    }
    return this.folderDownloader.downloadFolderWithPassword(
      folderJsonUrl,
      password,
      destinationPath
    );
  }

  async downloadFolderWithoutPassword(
    folderJsonUrl: string,
    destinationPath: string
  ): Promise<void> {
    if (!this.folderDownloader) {
      throw new Error('Folder downloader not implemented');
    }
    return this.folderDownloader.downloadFolderWithoutPassword(
      folderJsonUrl,
      destinationPath
    );
  }
}

import { IFolderDownloader } from "../interfaces/IFolderDownloader";
import { IPathAdapter } from "../interfaces/IPathAdapter";
import { BaseFolderResumeHandler } from "../resume/resume-download/BaseFodlerResumeHandler";

export abstract class BaseFolderDownloader<T> implements IFolderDownloader<T> {
  constructor(
    protected readonly downloader: {
      downloadFileWithPassword(
        jsonUrl: string,
        password: string,
        destinationPath?: string,
        onProgress?: (done: number, total: number) => void
      ): Promise<void>;

      downloadFileWithoutPassword(
        jsonUrl: string,
        destinationPath?: string,
        onProgress?: (done: number, total: number) => void
      ): Promise<void>;
    },
    protected readonly folderResumeHandler: BaseFolderResumeHandler,
    protected readonly pathAdapter: IPathAdapter<T>
  ) {}

  async downloadFolderWithPassword(
    folderUrl: string,
    password: string,
    destination: T,
    onFileProgress?: (filePath: string, done: number, total: number) => void
  ): Promise<void> {
    await this.downloadFolder(folderUrl, destination, password, onFileProgress);
  }

  async downloadFolderWithoutPassword(
    folderUrl: string,
    destination: T,
    onFileProgress?: (filePath: string, done: number, total: number) => void
  ): Promise<void> {
    await this.downloadFolder(folderUrl, destination, undefined, onFileProgress);
  }

  private async downloadFolder(
    folderUrl: string,
    destination: T,
    password?: string,
    onFileProgress?: (filePath: string, done: number, total: number) => void
  ): Promise<void> {
    const res = await fetch(folderUrl);
    if (!res.ok) throw new Error(`Failed to fetch folder metadata: ${res.statusText}`);

    const response = await res.json();
    const folderName: string = typeof response.folderName === 'string'
      ? response.folderName
      : String(response.folderName);
    const files = response.files;

    console.log("folderName resolved:", folderName);

    const root = await this.pathAdapter.createRootFolder(destination, folderName);

    // Resume progress support
    await this.folderResumeHandler.loadProgress(folderName);

    for (const file of files) {
      const { path: relativePath, metadataUrl } = file;

      if (this.folderResumeHandler.getCompletedFiles().has(relativePath)) {
        console.log(`Skipping already downloaded file: ${relativePath}`);
        continue;
      }

      const fileHandle = await this.pathAdapter.createFileHandle(root, relativePath);

      const progressCallback = onFileProgress
        ? (done: number, total: number) => onFileProgress(relativePath, done, total)
        : undefined;

      if (password) {
        await this.downloader.downloadFileWithPassword(metadataUrl, password, fileHandle, progressCallback);
      } else {
        await this.downloader.downloadFileWithoutPassword(metadataUrl, fileHandle, progressCallback);
      }

      await this.folderResumeHandler.markFileCompleted(relativePath, folderName);

      console.log(`Downloaded: ${relativePath}`);
    }

    await this.folderResumeHandler.clearProgress(folderName);
    console.log("Folder download completed.");
  }
}

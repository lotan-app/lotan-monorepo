import { WorkerPool } from '../../lib/WorkerPool';
import { IFileHandler } from '../interfaces/IFileHandler';
import { IFileDownloader } from '../interfaces/IFileDownloader';
import { BaseDownloadResumeHandler } from '../resume/resume-download/BaseResumeDownloader';
import { decryptChunkAES } from '../../lib/CryptoUtils';

export abstract class BaseFileDownloader implements IFileDownloader {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  public workerPool;

  constructor(
    public readonly fileHandler: IFileHandler,
    public readonly resumeHandler: BaseDownloadResumeHandler,
    maxWorkers: number,
  ) {
    this.workerPool = new WorkerPool(maxWorkers);
  }

  protected abstract finalizeDownload(): Promise<void>;

  async downloadFileWithPassword(jsonUrl: string, password: string, destinationPath?: string, onProgress?: (done: number, total: number) => void): Promise<void> {
    return this.downloadFile(jsonUrl, destinationPath, password, onProgress);
  }

  async downloadFileWithoutPassword(jsonUrl: string, destinationPath?: string, onProgress?: (done: number, total: number) => void): Promise<void> {
    return this.downloadFile(jsonUrl, destinationPath, undefined, onProgress);
  }
  async normalizeDestinationPath(destinationPath: string | FileSystemFileHandle): Promise<string> {
    if (typeof destinationPath === 'string') {
      return destinationPath;
    } else if (destinationPath && typeof destinationPath === 'object' && 'name' in destinationPath) {
      return destinationPath.name;
    } else {
      throw new Error('Invalid destinationPath: must be a string or an object with a name property');
    }
  }
  
  private async downloadFile(jsonUrl: string, destinationPath?: string |FileSystemFileHandle, password?: string, onProgress?: (done: number, total: number) => void) {
    await this.resumeHandler.clearCompletedChunks();
    const response = await fetch(jsonUrl);
    if (!response.ok) throw new Error(`Failed to fetch JSON metadata: ${response.statusText}`);

    const jsonData = await response.json();
    if (!jsonData.chunks || !Array.isArray(jsonData.chunks)) {
      throw new Error("Invalid JSON structure: 'chunks' is missing or not an array");
    }
    if (!destinationPath) {
      destinationPath = `${jsonData.metadata.fileName}.ProgressDownload`;
    }
    const normalizedPath = await this.normalizeDestinationPath(destinationPath || `${jsonData.metadata.fileName}.ProgressDownload`);
    
    await this.resumeHandler.loadProgress(normalizedPath);
    console.log(`Downloading file from ${jsonUrl} to ${destinationPath}...`);
    await this.fileHandler.openFile(destinationPath, 'write');

    const completedChunks = this.resumeHandler.getCompletedChunks();
    console.log("Already completed chunk indexes:", [...completedChunks]);
    console.log("All chunk indexes in metadata:", jsonData.chunks.map(c => c.index));
    const pendingChunks = jsonData.chunks.filter(chunk => !completedChunks.has(chunk.index));

    if (pendingChunks.length > 0) {
      console.log(`Resuming download, ${pendingChunks.length} chunks remaining...`);
      await this.downloadChunks(pendingChunks, password, normalizedPath, onProgress, completedChunks.size, jsonData.chunks.length);
    } else {
      console.log('All chunks already downloaded.');
    }
    await this.finalizeDownload();
    await this.fileHandler.closeFile();
    await this.resumeHandler.clearProgress(normalizedPath);
    console.log('File successfully downloaded!');
  }

  private async downloadChunks(chunks: any[], password?: string, destinationPath?: string, onProgress?: (done: number, total: number) => void, alreadyDone = 0, totalChunks = 0) {
    let doneChunks = alreadyDone;
    const total = totalChunks || (alreadyDone + chunks.length);

    await Promise.allSettled(
      chunks.map(chunk =>
        this.workerPool.addTask(() =>
          this.downloadChunk(chunk, password, destinationPath).then(() => {
            doneChunks++;
            onProgress?.(doneChunks, total);
          })
        )
      )
    );
  }

  private async downloadChunk(chunk: any, password?: string, destinationPath?: string) {
    console.log(`Downloading chunk ${chunk.index}...`);

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const chunkResponse = await fetch(chunk.url);
        if (!chunkResponse.ok) throw new Error(`Failed to fetch chunk ${chunk.index}: ${chunkResponse.statusText}`);

        let chunkData: any = new Uint8Array(await chunkResponse.arrayBuffer());
        if (password) {
          chunkData = decryptChunkAES(password, chunkData);
        }

        await this.fileHandler.writeBytes(
          chunk.index * chunk.chunkSize,
          (chunk.index + 1) * chunk.chunkSize,
          chunkData,
          chunk.index,
        );

        await this.resumeHandler.markChunkCompleted(chunk.index, destinationPath!);

        console.log(`Chunk ${chunk.index} downloaded and stored.`);
        break;
      } catch (error) {
        console.error(`Error downloading chunk ${chunk.index} (Attempt ${attempt}):`, error);
        if (attempt === this.MAX_RETRIES)
          throw new Error(`Failed to download chunk ${chunk.index} after ${this.MAX_RETRIES} attempts.`);
        await new Promise(res => setTimeout(res, this.RETRY_DELAY));
      }
    }
  }
}

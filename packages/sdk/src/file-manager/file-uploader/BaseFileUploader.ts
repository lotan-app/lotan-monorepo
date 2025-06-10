import { IFileUploader } from '../interfaces/IFileUploader';
import { IFileHandler } from '../interfaces/IFileHandler';
import { BaseResumeHandler } from '../resume/resume-upload/BaseResumeHandler';
import { WorkerPool } from '../../lib/WorkerPool';
import { encryptChunkAES } from '../../lib/CryptoUtils';

export abstract class BaseFileUploader<T> implements IFileUploader {
  protected readonly MAX_RETRIES = 3;
  protected readonly RETRY_DELAY = 1000;
  private workerPool: WorkerPool;
  private readonly CHUNK_SIZE = 9 * 1024 * 1024; //if you want to change the chunk size here. please change it in the FileWebDownload as well.
  constructor(
    protected readonly fileHandler: IFileHandler,
    protected readonly resumeHandler: BaseResumeHandler,
    public readonly publisherUrl: string,
    public readonly aggregatorUrl: string,
    maxWorkers: number,
  ) {
    this.workerPool = new WorkerPool(maxWorkers);
  }

  async uploadFileWithPassword(file: T, password: string, onProgress?: (uploaded: number, total: number) => void) {
    return this.uploadFile(file, password, onProgress);
  }

  async uploadFileWithoutPassword(file: T, onProgress?: (uploaded: number, total: number) => void) {
    return this.uploadFile(file, undefined, onProgress);
  }
  protected abstract getFileName(file: T): string;

  private async uploadFile(file: T, password?: string, onProgress?: (uploaded: number, total: number) => void) {
    if (typeof file === 'string') {
      await this.fileHandler.openFile(file);
    } else if (file instanceof File) {
      await this.fileHandler.openFile('read');
    } else {
      throw new Error('Invalid file type');
    }

    await this.resumeHandler.clearCompletedChunks();
    const fileSize = (await this.fileHandler.stat()).size;
    const chunkSize = this.CHUNK_SIZE;
    const totalChunks = Math.ceil(fileSize / chunkSize);
    const fileName = this.getFileName(file);
    const metadata = this.createMetadata(fileName, fileSize);

    await this.resumeHandler.loadProgress(fileName);
    const completedChunks = this.resumeHandler.getCompletedChunks();
    const chunkInfos: { url: string; blobId: string; index: number; chunkSize: number }[] = [];

    const completedChunksSet = new Set(completedChunks.map(chunk => chunk.index));
    let uploadedCount = completedChunksSet.size;

    await Promise.allSettled(
      Array.from({ length: totalChunks }, (_, chunkIndex) => {
        if (!completedChunksSet.has(chunkIndex)) {
          return this.workerPool.addTask(() =>
            this.uploadChunkWithRetry(
              chunkIndex,
              file,
              fileSize,
              totalChunks,
              password,
              chunkInfos,
              fileName,
              chunkSize,
            ).then(() => {
              uploadedCount++;
              onProgress?.(uploadedCount, totalChunks);
            }),
          );
        }

        return null;
      }).filter(Boolean),
    );

    return this.uploadMetadata(metadata, chunkInfos, fileName);
  }

  private async uploadChunkWithRetry(
    chunkIndex: number,
    file: T,
    fileSize: number,
    totalChunks: number,
    password: string | undefined,
    chunkInfos: any[],
    fileName: string,
    chunkSize: number,
  ) {
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        await this.uploadChunk(chunkIndex, file, fileSize, totalChunks, password, chunkInfos, fileName, chunkSize);
        return;
      } catch (error) {
        console.error(`Chunk ${chunkIndex} failed (Attempt ${attempt + 1}):`, error);

        if (attempt < this.MAX_RETRIES - 1) {
          console.log(`Retrying chunk ${chunkIndex} immediately...`);
          continue;
        } else {
          console.error(`Upload chunk ${chunkIndex} failed after ${this.MAX_RETRIES} attempts.`);
        }
      }
    }
  }

  private async uploadChunk(
    chunkIndex: number,
    file: T,
    fileSize: number,
    totalChunks: number,
    password: string | undefined,
    chunkInfos: any[],
    fileName: string,
    chunkSize: number,
  ) {
    console.log(`Uploading chunk ${chunkIndex + 1}...`);
    const startByte = chunkIndex * chunkSize;
    const endByte = Math.min(startByte + chunkSize, fileSize);
    let body = await this.fileHandler.readBytes(startByte, endByte);

    if (password) {
      body = encryptChunkAES(password, body);
    }

    const response = await fetch(this.publisherUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Chunk-Index': chunkIndex.toString(),
        'X-Total-Chunks': totalChunks.toString(),
      },
      body,
    });

    if (!response.ok) throw new Error(`Upload chunk ${chunkIndex + 1} failed: ${response.statusText}`);

    const data = await response.json();
    const blobId = data?.newlyCreated?.blobObject?.blobId || data?.alreadyCertified?.blobId;
    const chunkInfo = { url: `${this.aggregatorUrl}/${blobId}`, blobId, index: chunkIndex, chunkSize: chunkSize };

    chunkInfos.push(chunkInfo);
    await this.resumeHandler.markChunkCompleted(chunkInfo, fileName);
  }

  private async uploadMetadata(metadata: any, chunkInfos: any[], fileName: string) {
    const fullChunkList = this.resumeHandler.getCompletedChunks();
    console.log('Completed Chunks:', fullChunkList);
    const jsonData = { metadata, chunks: fullChunkList };

    const response = await fetch(this.publisherUrl, {
      method: 'PUT',
      body: JSON.stringify(jsonData, null, 2),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`Upload file JSON failed: ${response.statusText}`);

    const data = await response.json();
    const jsonBlobId = data?.newlyCreated?.blobObject?.blobId || data?.alreadyCertified?.blobId;
    const jsonUrl = jsonBlobId ? `${this.aggregatorUrl}/${jsonBlobId}` : '';

    if (fullChunkList.length > 0) {
      console.log('Upload completed, clearing progress...');
      await this.resumeHandler.clearProgress(fileName);
    }

    return { jsonBlobId, jsonUrl, chunks: fullChunkList };
  }

  protected createMetadata(fileName: string, fileSize: number) {
    return {
      fileName,
      fileSize: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
    };
  }
}

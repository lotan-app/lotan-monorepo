import { BaseFileDownloader } from "./BaseFileDownloader";
import { WebFileHandler } from "../file-handler/WebFileHandler";
import { IndexedFileHandler } from "../file-handler/IndexedFileHandler";
import { WebDownloadResumeHandler } from "../resume/resume-download/IndexedDBDownLoadResume";

export class FileWebDownloader extends BaseFileDownloader {
    public WebFileHandler = new WebFileHandler();

    constructor() {
        const maxWorkers = Math.max(1, (navigator.hardwareConcurrency || 4) + 2);
        super(
            new IndexedFileHandler(),
            new WebDownloadResumeHandler(),
            maxWorkers
        );
    }

  async finalizeDownload() {
    console.log("Writing data from IndexedDB to file using streaming batches...");
  
    const reader = this.fileHandler.readBytes(0, Infinity);
  
    if (typeof (reader as any)[Symbol.asyncIterator] === 'function') {
      for await (const batch of reader as AsyncGenerator<any[]>) {
        const tempBuffer = await Promise.all(
          batch.map(chunk => Promise.resolve({
            startByte: chunk.startByte,
            endByte: chunk.endByte,
            data: chunk.chunkData,
            chunkIndex: chunk.chunkIndex,
          }))
        );

        for (const chunk of tempBuffer) {
          await this.WebFileHandler.writeBytes(
            chunk.startByte,
            chunk.endByte,
            chunk.data,
            chunk.chunkIndex
          );
          console.log(`Chunk ${chunk.chunkIndex} written safely.`);
        }
      }
  
    } else {
      const chunks = await reader;
      for (const chunk of chunks) {
        await this.WebFileHandler.writeBytes(
          chunk.startByte,
          chunk.endByte,
          chunk.chunkData,
          chunk.chunkIndex
        );
      }
    }
  
    await this.WebFileHandler.closeFile();
    console.log("File write completed.");
  }
  
  
      
    async downloadFileWithPassword(jsonUrl: string, password: string, destinationPath?: string, onProgress?: (done: number, total: number) => void) {
        if (destinationPath && typeof destinationPath !== 'string') {
            await this.WebFileHandler.openFile(destinationPath, 'write');
          }
      
        return super.downloadFileWithPassword(jsonUrl, password, destinationPath, onProgress);
    }

    async downloadFileWithoutPassword(jsonUrl: string, destinationPath?: string, onProgress?: (done: number, total: number) => void) {
        if (destinationPath && typeof destinationPath !== 'string') {
            await this.WebFileHandler.openFile(destinationPath, 'write');
          }
      
        return super.downloadFileWithoutPassword(jsonUrl, destinationPath, onProgress);
    }
}

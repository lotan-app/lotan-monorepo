import { BaseFileUploader } from './BaseFileUploader';
import { WebFileHandler } from '../file-handler/WebFileHandler';
import { IndexedDBResumeHandler } from '../resume/resume-upload/IndexedDBResumeHandler';

export class FileUploaderWeb extends BaseFileUploader<File> {
  public webFileHandler: WebFileHandler;

  constructor(publisherUrl: string, aggregatorUrl: string) {
    const maxWorkers = Math.max(1, navigator.hardwareConcurrency || 4) ;
    const fileHandler = new WebFileHandler(); 
    super(fileHandler, new IndexedDBResumeHandler(), publisherUrl, aggregatorUrl, maxWorkers);
    this.webFileHandler = fileHandler;
  }

  public getFileName(file: File): string {
    return file.name;
  }

  public async prepareFileHandle(file: File | FileSystemFileHandle, mode: "read" = "read") {
    if (file instanceof File) {
      (this.webFileHandler as any).file = file;
      console.log(`Prepared File: ${file.name}`);
    } else {
      await this.webFileHandler.openFile(file, mode);
    }
  }
  

  async uploadFileWithPassword(file: File, password: string, onProgress?: (uploaded: number, total: number) => void) {
    return super.uploadFileWithPassword(file, password, onProgress);
  }

  async uploadFileWithoutPassword(file: File, onProgress?: (uploaded: number, total: number) => void) {
    return super.uploadFileWithoutPassword(file, onProgress);
  }
}

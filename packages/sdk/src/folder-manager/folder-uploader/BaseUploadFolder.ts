import { IFolderUploader } from "../interfaces/IFolderUploader";
import { FolderFileEntry } from "../interfaces/FolderFileEntry";
import { IFolderUploadResult } from "../interfaces/IFolderUploadResult";
import { BaseFolderResumeHandler } from "../resume/resume-upload/BaseFolderResumeHandler";

export abstract class BaseFolderUploader<T> implements IFolderUploader {
  constructor(
    protected readonly uploader: {
      uploadFileWithPassword: (
        file: T,
        password: string,
        onProgress?: (uploaded: number, total: number) => void
      ) => Promise<{
        jsonBlobId: string;
        jsonUrl: string;
        chunks: any[];
      }>;
      uploadFileWithoutPassword: (
        file: T,
        onProgress?: (uploaded: number, total: number) => void
      ) => Promise<{
        jsonBlobId: string;
        jsonUrl: string;
        chunks: any[];
      }>;
      getFileName: (file: T) => string;
      publisherUrl: string;
      aggregatorUrl: string;
    },
    protected readonly FolderResumeHandler: BaseFolderResumeHandler,
    protected password?: string
  ) {}

  async uploadFolderFiles(
    files: FolderFileEntry<T>[],
    folderName: string,
    onProgress?: (relativePath: string, uploaded: number, total: number) => void
  ): Promise<IFolderUploadResult> {
    const results: IFolderUploadResult["uploaded"] = [];
    const folderResumeHandler = this.FolderResumeHandler;

    await folderResumeHandler.loadProgress(folderName);
    const completedFiles = folderResumeHandler.getCompletedFiles();

    const originalUploadWithPassword = this.uploader.uploadFileWithPassword.bind(this.uploader);
    const originalUploadWithoutPassword = this.uploader.uploadFileWithoutPassword.bind(this.uploader);

    for (const { file, relativePath } of files) {
      const originalGetFileName = this.uploader.getFileName;
      (this.uploader as any).getFileName = () => relativePath;

      if ("prepareFileHandle" in this.uploader && typeof this.uploader.prepareFileHandle === "function") {
        await this.uploader.prepareFileHandle(file);
      }

      let result;

      try {
        const existing = completedFiles.get(relativePath);
        if (existing) {
          console.log(`Skipping already uploaded file: ${relativePath}`);
          result = {
            jsonUrl: existing.jsonUrl,
            jsonBlobId: existing.jsonBlobId,
            chunks: [],
          };
        } else {
          result = this.password
            ? await originalUploadWithPassword(file, this.password, (uploaded, total) =>
                onProgress?.(relativePath, uploaded, total)
              )
            : await originalUploadWithoutPassword(file, (uploaded, total) =>
                onProgress?.(relativePath, uploaded, total)
              );

          // Mark file as completed
          await folderResumeHandler.markFileCompleted(
            relativePath,
            result.jsonUrl,
            result.jsonBlobId,
            folderName
          );
        }

        results.push({
          relativePath,
          jsonBlobId: result.jsonBlobId,
          jsonUrl: result.jsonUrl,
        });
      } catch (error) {
        console.error(`Upload failed for ${relativePath}:`, error);
        throw error;
      }

      (this.uploader as any).getFileName = originalGetFileName;
    }

    // Clear resume info if all files uploaded
    await folderResumeHandler.clearProgress(folderName);

    const folderMetadata = {
      folderName,
      files: results.map((f) => ({
        path: f.relativePath,
        metadataUrl: f.jsonUrl,
        metadataBlobId: f.jsonBlobId,
      })),
    };

    const response = await fetch(this.uploader.publisherUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(folderMetadata, null, 2),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload folder metadata: ${response.statusText}`);
    }

    const data = await response.json();
    const folderBlobId = data?.newlyCreated?.blobObject?.blobId || data?.alreadyCertified?.blobId;
    const folderUrl = `${this.uploader.aggregatorUrl}/${folderBlobId}`;

    return {
      folderMetadata,
      folderBlobId,
      folderUrl,
      uploaded: results,
    };
  }

  abstract uploadFolderWithPassword(
    folderHandle: FileSystemDirectoryHandle | string,
    password: string
  ): Promise<IFolderUploadResult>;

  abstract uploadFolderWithoutPassword(
    folderHandle: FileSystemDirectoryHandle | string
  ): Promise<IFolderUploadResult>;
}

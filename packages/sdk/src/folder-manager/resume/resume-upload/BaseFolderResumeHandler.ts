export abstract class BaseFolderResumeHandler {
  protected completedFiles: Map<string, { jsonUrl: string; jsonBlobId: string }> = new Map();

  abstract loadProgress(folderName: string): Promise<void>;
  abstract saveProgress(folderName: string): Promise<void>;
  abstract clearProgress(folderName: string): Promise<void>;

  async markFileCompleted(
    relativePath: string,
    jsonUrl: string,
    jsonBlobId: string,
    folderName?: string
  ): Promise<void> {
    this.completedFiles.set(relativePath, { jsonUrl, jsonBlobId });
    await this.saveProgress(folderName);
  }

  getCompletedFiles(): Map<string, { jsonUrl: string; jsonBlobId: string }> {
    return this.completedFiles;
  }

  clearCompletedFiles(): void {
    this.completedFiles.clear();
  }
}

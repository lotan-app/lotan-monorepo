export abstract class BaseFolderResumeHandler {
  protected completedFiles: Set<string> = new Set();

  abstract loadProgress(folderName: string): Promise<void>;
  abstract saveProgress(folderName: string): Promise<void>;
  abstract clearProgress(folderName: string): Promise<void>;

  async markFileCompleted(relativePath: string, folderName?: string): Promise<void> {
    this.completedFiles.add(relativePath);
    await this.saveProgress(folderName);
  }

  getCompletedFiles(): Set<string> {
    return this.completedFiles;
  }

  clearCompletedFiles(): void {
    this.completedFiles.clear();
  }
}

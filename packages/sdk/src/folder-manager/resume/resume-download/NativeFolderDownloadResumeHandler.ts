import { BaseFolderResumeHandler } from '../resume-download/BaseFodlerResumeHandler';
import { NativeFsOverride } from '../../../lib/NativeFSOverride';

export class NativeFolderDownloadResumeHandler extends BaseFolderResumeHandler {
  private resumeFilePath?: string;

  async loadProgress(folderName: string): Promise<void> {
    this.resumeFilePath = `.resume.download.${folderName}.json`;
    if (!NativeFsOverride.fs.existsSync(this.resumeFilePath)) return;

    try {
      const data = JSON.parse(NativeFsOverride.fs.readFileSync(this.resumeFilePath, 'utf-8'));
      this.clearCompletedFiles();
      data.forEach((path: string) => this.completedFiles.add(path));
      console.log(`Resume progress loaded for folder: ${folderName}`);
    } catch (error) {
      console.error("Error loading folder download resume:", error);
    }
  }

  async saveProgress(folderName: string): Promise<void> {
    if (!this.resumeFilePath) return;
    try {
      NativeFsOverride.fs.writeFileSync(
        this.resumeFilePath,
        JSON.stringify(Array.from(this.completedFiles), null, 2)
      );
      console.log(`Progress saved for folder: ${folderName}`);
    } catch (error) {
      console.error("Error saving folder download resume:", error);
    }
  }

  async clearProgress(folderName: string): Promise<void> {
    if (!this.resumeFilePath || !NativeFsOverride.fs.existsSync(this.resumeFilePath)) return;
    try {
      NativeFsOverride.fs.unlinkSync(this.resumeFilePath);
      this.clearCompletedFiles();
      console.log(`Cleared progress for folder: ${folderName}`);
    } catch (error) {
      console.error("Error clearing folder download resume:", error);
    }
  }
}

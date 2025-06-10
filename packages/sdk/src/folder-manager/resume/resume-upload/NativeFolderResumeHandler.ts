import { BaseFolderResumeHandler } from './BaseFolderResumeHandler';
import { NativeFsOverride } from '../../../lib/NativeFSOverride';
import { ResumeMeta } from '../../interfaces/IResumeMeta';

export class NativeFolderResumeHandler extends BaseFolderResumeHandler {
  private resumeFilePath?: string;

  async loadProgress(folderName: string): Promise<void> {
    this.resumeFilePath = `.resume.${folderName}.json`;

    if (!NativeFsOverride.fs.existsSync(this.resumeFilePath)) {
      console.log(`[Resume] No folder resume file found: ${this.resumeFilePath}`);
      return;
    }

    try {
      const raw = NativeFsOverride.fs.readFileSync(this.resumeFilePath, 'utf-8');
      const data: Record<string, ResumeMeta> = JSON.parse(raw);

      this.clearCompletedFiles();

      for (const [relativePath, meta] of Object.entries(data)) {
        this.completedFiles.set(relativePath, meta);
      }

      console.log(`[Resume] Loaded ${this.completedFiles.size} completed file(s) from ${this.resumeFilePath}`);
    } catch (error) {
      console.error(`[Resume] Error loading folder resume file: ${this.resumeFilePath}`, error);
    }
  }

  async saveProgress(folderName: string): Promise<void> {
    if (!this.resumeFilePath) return;

    const obj: Record<string, ResumeMeta> = {};
    for (const [relativePath, meta] of this.completedFiles.entries()) {
      obj[relativePath] = meta;
    }

    try {
      NativeFsOverride.fs.writeFileSync(this.resumeFilePath, JSON.stringify(obj, null, 2), 'utf-8');
      console.log(`[Resume] Saved folder resume to ${this.resumeFilePath}`);
    } catch (error) {
      console.error(`[Resume] Error saving folder resume to ${this.resumeFilePath}`, error);
    }
  }

  async clearProgress(folderName: string): Promise<void> {
    if (!this.resumeFilePath || !NativeFsOverride.fs.existsSync(this.resumeFilePath)) return;

    try {
      NativeFsOverride.fs.unlinkSync(this.resumeFilePath);
      this.clearCompletedFiles();
      console.log(`[Resume] Cleared folder resume file: ${this.resumeFilePath}`);
    } catch (error) {
      console.error(`[Resume] Error clearing folder resume file: ${this.resumeFilePath}`, error);
    }
  }
}

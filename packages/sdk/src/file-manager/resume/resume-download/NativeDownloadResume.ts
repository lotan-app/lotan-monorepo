import { NativeFsOverride } from '../../../lib/NativeFSOverride';
import { BaseDownloadResumeHandler } from './BaseResumeDownloader';

export class NativeDownloadResumeHandler extends BaseDownloadResumeHandler {
  private progressFile?: string;

  async loadProgress(fileName: string): Promise<void> {
    this.progressFile = `${fileName}.download.resume.json`;
    if (!NativeFsOverride.fs.existsSync(this.progressFile)) return;

    try {
      const data = JSON.parse(NativeFsOverride.fs.readFileSync(this.progressFile, 'utf-8'));
      this.completedChunks = new Set(data);
      console.log('Resume progress loaded for download:', this.completedChunks);
    } catch (error) {
      console.error('Error loading download resume file:', error);
    }
  }

  async saveProgress(): Promise<void> {
    if (!this.progressFile) return;

    try {
      NativeFsOverride.fs.writeFileSync(this.progressFile, JSON.stringify([...this.completedChunks], null, 2));
      console.log(`Download progress saved to file: ${this.progressFile}`);
    } catch (error) {
      console.error('Error saving download progress:', error);
    }
  }

  async clearProgress(): Promise<void> {
    this.completedChunks.clear();
    if (!this.progressFile || !NativeFsOverride.fs.existsSync(this.progressFile)) return;

    try {
      NativeFsOverride.fs.unlinkSync(this.progressFile);
      console.log('Cleared download progress file.');
    } catch (error) {
      console.error('Error clearing download progress:', error);
    }
  }
}

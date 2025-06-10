import { NativeFsOverride } from '../../../lib/NativeFSOverride';
import { BaseResumeHandler } from './BaseResumeHandler';


export class NativeResumeHandler extends BaseResumeHandler {
    private progressFile?: string;

    async loadProgress(fileName: string): Promise<void> {
        this.progressFile = `${fileName}.resume.json`;

        if (!NativeFsOverride.fs.existsSync(this.progressFile)) return;

        try {
            const data = JSON.parse(NativeFsOverride.fs.readFileSync(this.progressFile, 'utf-8'));
            this.clearCompletedChunks(); 
            data.forEach((chunk: any) => this.completedChunks.set(chunk.index, chunk));
            console.log("Resume progress loaded:", this.completedChunks);
        } catch (error) {
            console.error("Error loading resume file:", error);
        }
    }

    async saveProgress(fileName: string): Promise<void> {
        if (!this.progressFile) return;

        const dir = NativeFsOverride.path.dirname(this.progressFile);
        await this.ensureDirectoryExists(dir); 

        try {
            NativeFsOverride.fs.writeFileSync(this.progressFile, JSON.stringify(Array.from(this.completedChunks.values()), null, 2));
            console.log(`Progress saved to file: ${this.progressFile}`);
        } catch (error) {
            console.error("Error saving progress:", error);
        }
    }

    async clearProgress(fileName: string): Promise<void> {
        if (!this.progressFile || !NativeFsOverride.fs.existsSync(this.progressFile)) return;

        try {
            NativeFsOverride.fs.unlinkSync(this.progressFile);
            console.log("Cleared progress file.");
        } catch (error) {
            console.error("Error clearing progress:", error);
        }
    }

    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await NativeFsOverride.fs.promises.mkdir(dirPath, { recursive: true });
        } catch (error) {
            console.error(`Failed to create directory: ${dirPath}`, error);
        }
    }
}

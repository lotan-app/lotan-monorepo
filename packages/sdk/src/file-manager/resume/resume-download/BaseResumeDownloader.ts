export abstract class BaseDownloadResumeHandler {
    protected completedChunks: Set<number> = new Set();

    abstract loadProgress(fileName: string): Promise<void>;
    abstract saveProgress(fileName: string): Promise<void>;
    abstract clearProgress(fileName: string): Promise<void>;

    async markChunkCompleted(chunkIndex: number, fileName?: string): Promise<void> {
        this.completedChunks.add(chunkIndex);
        await this.saveProgress(fileName);
    }

    getCompletedChunks(): Set<number> {
        return this.completedChunks;
    }
    clearCompletedChunks(): void {
        this.completedChunks.clear();
        console.log("Completed chunks cleared.");
    }
}

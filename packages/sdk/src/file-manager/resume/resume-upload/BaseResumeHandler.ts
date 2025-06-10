export abstract class BaseResumeHandler {
    protected completedChunks: Map<number, { url: string; blobId: string; index: number; chunkSize: number }> = new Map();

    abstract loadProgress(fileName: string): Promise<void>;
    abstract saveProgress(fileName: string): Promise<void>;
    abstract clearProgress(fileName: string): Promise<void>;

    async markChunkCompleted(chunk: { url: string; blobId: string; index: number; chunkSize: number }, fileName: string): Promise<void> {
    
        if (this.completedChunks.has(chunk.index)) {
            console.log(`Chunk ${chunk.index} is already recorded, skipping.`);
            return;
        }
    
        this.completedChunks.set(chunk.index, chunk);
        await this.saveProgress(fileName);
        console.log(`Chunk ${chunk.index} progress saved.`);
    }

    getCompletedChunks(): { url: string; blobId: string; index: number; chunkSize: number }[] {
        return Array.from(this.completedChunks.values());
    }
    clearCompletedChunks(): void {
        this.completedChunks.clear();
        console.log("Completed chunks cleared.");
    }
}

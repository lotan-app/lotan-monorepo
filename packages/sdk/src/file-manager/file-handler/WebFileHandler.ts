import { IFileHandler } from "../interfaces/IFileHandler";

export class WebFileHandler implements IFileHandler {
    public fileHandle?: FileSystemFileHandle | null = null;
    private file?: File;
    public writer?: FileSystemWritableFileStream;
  
    async openFile(file: FileSystemFileHandle, mode?: "read" | "write"): Promise<void> {
        this.fileHandle = file;

        if (mode === "read") {
            this.file = await file.getFile();
            console.log(`File opened: ${this.file.name}`);
        } else {
            console.log(`File selected for writing: ${file.name}`);
        }
    }
    async readBytes(start: number, end: number): Promise<Uint8Array> {
        if (!this.file) throw new Error("File not opened");
        const blob = this.file.slice(start, end);
        const arrayBuffer = await blob.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }

    async writeBytes(start: number, end: number, data: Uint8Array, chunkIndex: number): Promise<void> {
        if (!this.fileHandle) {
            throw new Error("File handle is missing. Please select a file first.");
        }
        if (!this.writer) {
            this.writer = await this.fileHandle.createWritable();
        }
    
        try {
            await this.writer.write({ type: "write", position: start, data });
            console.log(`Chunk ${chunkIndex} written at ${start} - ${end}`);
        } catch (error) {
            console.error(`Error writing chunk ${chunkIndex} at ${start} - ${end}:`, error);
            throw error;
        }
    }
    

    async closeFile(): Promise<void> {
        if (this.writer) {
            await this.writer.close();
            this.writer = undefined;
        }
        this.fileHandle = undefined;
        this.file = undefined;
    }

    async stat(): Promise<{ size: number }> {
        if (!this.file) throw new Error("File is not opened.");
        return { size: this.file.size };
    }
}

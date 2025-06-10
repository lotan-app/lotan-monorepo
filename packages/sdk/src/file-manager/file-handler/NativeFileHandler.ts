import { NativeFsOverride } from '../../lib/NativeFSOverride';
import { IFileHandler } from '../interfaces/IFileHandler';

export class NativeFileHandler implements IFileHandler {
    private filePath: string | null = null;
    private fileHandle: any = null;

    async openFile(filePath: string, mode: 'read' | 'write' = 'read'): Promise<void> {
        console.log(`Opening file: ${filePath}`);
        if (this.fileHandle) await this.closeFile();

        this.filePath = filePath;
        this.fileHandle = await NativeFsOverride.fs.promises.open(filePath, mode === 'read' ? 'r' : 'w');
    }

    async readBytes(start: number, end: number): Promise<Uint8Array> {
        if (!this.fileHandle) throw new Error('File is not opened');

        const length = end - start;
        const buffer = Buffer.alloc(length);

        try {
            const { bytesRead } = await this.fileHandle.read(buffer, 0, length, start);
            return new Uint8Array(buffer.slice(0, bytesRead));
        } catch (error) {
            console.error(`Error reading bytes from ${start} to ${end}:`, error);
            throw error;
        }
    }

    async writeBytes(start: number, end: number, data: Uint8Array, chunkIndex: number): Promise<void> {
        if (!this.fileHandle) throw new Error('File is not opened');
        try {
            const writeLength = Math.min(data.length, end - start);
            await this.fileHandle.write(data, 0, writeLength, start);
            console.log(`Chunk ${chunkIndex} written from ${start} to ${end}`);
        } catch (error) {
            console.error(`Error writing chunk at ${start} - ${end}:`, error);
            throw error;
        }
    }

    async closeFile(): Promise<void> {
        if (this.fileHandle) {
            try {
                await this.fileHandle.close();
                console.log("File handle closed successfully.");
            } catch (error) {
                console.error("Error while closing file handle:", error);
            } finally {
                this.fileHandle = null;
                this.filePath = null;
            }
        }
    }

    async stat(): Promise<{ size: number }> {
        if (!this.filePath) throw new Error('File is not opened');
        const fileStats = await NativeFsOverride.fs.promises.stat(this.filePath);
        return { size: fileStats.size };
    }
}

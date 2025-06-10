export interface IFileHandler {
    openFile(file: FileSystemFileHandle | string, mode?: "read" | "write"): Promise<void>;
    readBytes(start: number, end: number): Promise<any> | AsyncGenerator<any>;
    writeBytes( start: number, end:number,data: Uint8Array, chunkIndex: number): Promise<void>;
    closeFile(): Promise<void>;
    stat(): Promise<{ size: number }>;
}

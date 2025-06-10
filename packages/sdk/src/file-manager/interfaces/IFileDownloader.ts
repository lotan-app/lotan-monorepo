export interface IFileDownloader {
    downloadFileWithPassword(
        jsonUrl: string,
        password: string,
        destinationPath?: string,
        onProgress?: (done: number, total: number) => void
    ): Promise<void>;

    downloadFileWithoutPassword(
        jsonUrl: string,
        destinationPath?: string,
        onProgress?: (done: number, total: number) => void
    ): Promise<void>;
}

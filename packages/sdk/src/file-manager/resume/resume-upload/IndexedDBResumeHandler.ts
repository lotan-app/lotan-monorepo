import { BaseResumeHandler } from "./BaseResumeHandler";

export class IndexedDBResumeHandler extends BaseResumeHandler {
    private readonly dbName = "ProgressUploadChunkDB";
    private readonly storeName = "UploadChunks";
    private db: IDBDatabase | null = null;

    async loadProgress(fileName: string): Promise<void> {
        await this.initIndexedDB();
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.get(fileName);

            request.onsuccess = () => {
                if (request.result) {
                    this.clearCompletedChunks(); 
                    request.result.forEach((chunk: any) => this.completedChunks.set(chunk.index, chunk));
                    console.log("Resume progress loaded:", this.completedChunks);
                }
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveProgress(fileName: string): Promise<void> {
        if (!this.db) await this.initIndexedDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, "readwrite");
            transaction.objectStore(this.storeName).put(Array.from(this.completedChunks.values()), fileName);
            transaction.oncomplete = () => resolve(console.log(`Progress saved for file: ${fileName}`));
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async clearProgress(fileName: string): Promise<void> {
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, "readwrite");
            transaction.objectStore(this.storeName).delete(fileName);
            transaction.oncomplete = () => resolve(console.log("Cleared progress."));
            transaction.onerror = () => reject(transaction.error);
        });
    }

    private async initIndexedDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (event) => {
                console.log("IndexedDB upgrading...");
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }
}

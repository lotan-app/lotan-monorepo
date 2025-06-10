import { IFileHandler } from "../interfaces/IFileHandler";

export class IndexedFileHandler implements IFileHandler {
    private db: IDBDatabase | null = null;
    private dbName = "DownloadProgressDB";
    private storeName = "downloadChunks";

    async openFile(): Promise<void> {
        if (this.db) return; 
    
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
    
            request.onupgradeneeded = (event) => {
                console.log("IndexedDB: Creating or upgrading database...");
                const db = (event.target as IDBOpenDBRequest).result;
                
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: "chunkIndex" });
                    store.createIndex("chunkIndex", "chunkIndex", { unique: true });
                }
            };
    
            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                console.log("IndexedDB opened successfully.");
                resolve();
            };
    
            request.onerror = () => {
                console.error(" IndexedDB error:", request.error);
                reject(request.error);
            };
        });
    }
    
    
    
    async writeBytes(start: number, end: number, data: Uint8Array, chunkIndex: number): Promise<void> {
        if (!this.db) await this.openFile();
    
        return new Promise((resolve, reject) => {
            try {
                console.log(`Saving chunk ${chunkIndex} (${start} - ${end}) to IndexedDB...`);
    
                const transaction = this.db!.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);
    
                const chunkData = {
                    chunkIndex,
                    startByte: start,
                    endByte: end,
                    data: Array.from(data),
                };
    
                store.put(chunkData);
    
                transaction.oncomplete = () => {
                    console.log(`Chunk ${chunkIndex} saved successfully.`);
                    resolve();
                };
    
                transaction.onerror = (event) => {
                    console.error(`IndexedDB Transaction Error on chunk ${chunkIndex}:`, transaction.error);
                    reject(transaction.error);
                };
            } catch (error) {
                console.error(`Failed to write chunk ${chunkIndex} to IndexedDB:`, error);
                reject(error);
            }
        });
    }
      
    async *readBytes(start: number, end: number): AsyncGenerator<any[]> {
        const batchSize = 20;
        if (!this.db) await this.openFile();

        const transaction = this.db.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.openCursor();

        const queue: any[][] = [];
        let batch: any[] = [];
        let done = false;

        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                const chunk = cursor.value;
                if (chunk.endByte > start && chunk.startByte < end) {
                    batch.push({
                        chunkIndex: chunk.chunkIndex,
                        startByte: chunk.startByte,
                        endByte: chunk.endByte,
                        chunkData: new Uint8Array(chunk.data),
                    });
                }
                if (batch.length >= batchSize) {
                    queue.push(batch);
                    batch = [];
                }
                cursor.continue();
            } else {
                if (batch.length > 0) queue.push(batch);
                done = true;
            }
        };

        while (!done || queue.length > 0) {
            if (queue.length > 0) {
                yield queue.shift()!;
            } else {
                await new Promise(res => setTimeout(res, 10));
            }
        }
    }
      
      

    async stat(): Promise<{ size: number }> {
        if (!this.db) await this.openFile();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const totalSize = request.result.reduce((acc: number, chunk: Uint8Array) => acc + chunk.byteLength, 0);
                resolve({ size: totalSize });
            };

            request.onerror = () => reject(request.error);
        });
    }
    async closeFile(): Promise<void> {
        if (!this.db) return;
    
        console.log("Clearing IndexedDB store before closing...");
    
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
    
            request.onsuccess = () => {
                console.log("IndexedDB store cleared.");
                this.db!.close();
                this.db = null;
                console.log("IndexedDB connection closed.");
                resolve();
            };
    
            request.onerror = () => {
                console.error("Error clearing IndexedDB:", request.error);
                reject(request.error);
            };
        });
    }
    
}

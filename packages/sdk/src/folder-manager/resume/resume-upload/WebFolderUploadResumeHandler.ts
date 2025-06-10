import { BaseFolderResumeHandler } from './BaseFolderResumeHandler';
import { ResumeMeta } from '../../interfaces/IResumeMeta';

export class IndexedDBUploadResumeHandler extends BaseFolderResumeHandler {
  private readonly dbName = "ProgressFolderUploadDB";
  private readonly storeName = "FilesUpload";
  private db: IDBDatabase | null = null;

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
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

  async loadProgress(folderName: string): Promise<void> {
    await this.initIndexedDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(folderName);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          this.clearCompletedFiles();
          const files: Record<string, ResumeMeta> = result;
          for (const [path, meta] of Object.entries(files)) {
            this.completedFiles.set(path, meta);
          }
          console.log(`[Resume] Loaded ${this.completedFiles.size} file(s) from IndexedDB for folder: ${folderName}`);
        }
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveProgress(folderName: string): Promise<void> {
    await this.initIndexedDB();
    if (!this.db) return;

    const objectToSave: Record<string, ResumeMeta> = {};
    for (const [path, meta] of this.completedFiles.entries()) {
      objectToSave[path] = meta;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);

      store.put(objectToSave, folderName);

      transaction.oncomplete = () => {
        console.log(`[Resume] Saved progress for folder: ${folderName}`);
        resolve();
      };

      transaction.onerror = () => reject(transaction.error);
    });
  }

  async clearProgress(folderName: string): Promise<void> {
    await this.initIndexedDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      store.delete(folderName);

      transaction.oncomplete = () => {
        this.clearCompletedFiles();
        console.log(`[Resume] Cleared progress for folder: ${folderName}`);
        resolve();
      };

      transaction.onerror = () => reject(transaction.error);
    });
  }

  async clearOldDatabaseIfExists(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);
      request.onsuccess = () => {
        console.warn(`[IndexedDB] Old database "${this.dbName}" deleted.`);
        resolve();
      };
      request.onerror = () => {
        console.error("[IndexedDB] Failed to delete old DB:", request.error);
        reject(request.error);
      };
      request.onblocked = () => {
        console.warn("[IndexedDB] Delete request blocked. Close all tabs using this DB.");
      };
    });
  }
}

import { BaseFolderResumeHandler } from '../resume-download/BaseFodlerResumeHandler';

export class WebFolderDownloadResumeHandler extends BaseFolderResumeHandler {
  private readonly dbName = 'FolderDownloadResumeDB';
  private readonly storeName = 'DownloadProgress';
  private db: IDBDatabase | null = null;

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'folderName' });
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

    if (typeof folderName !== 'string' || folderName.trim() === '') {
      console.error('Invalid folderName provided.');
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(folderName);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.completedFiles) {
          this.clearCompletedFiles();
          const files: string[] = result.completedFiles;
          files.forEach((path) => this.completedFiles.add(path));
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

    const filesArray = Array.from(this.completedFiles);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.put({ folderName, completedFiles: filesArray });

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
      const transaction = this.db!.transaction(this.storeName, 'readwrite');
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
        console.error('[IndexedDB] Failed to delete old DB:', request.error);
        reject(request.error);
      };
      request.onblocked = () => {
        console.warn('[IndexedDB] Delete request blocked. Close all tabs using this DB.');
      };
    });
  }
}

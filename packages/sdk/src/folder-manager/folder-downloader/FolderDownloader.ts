import { IFolderDownloader } from "../interfaces/IFolderDownloader";
import { FolderDownloadWeb } from "./FolderDownloadWeb";
import { FolderDownloadNative } from "./FolderDownloadNative";

export class FolderDownloader {
  static createDownloader(): IFolderDownloader {
    return typeof window !== "undefined"
      ? new FolderDownloadWeb()
      : new FolderDownloadNative();
  }
}

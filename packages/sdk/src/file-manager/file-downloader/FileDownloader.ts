import { FileNativeDownloader } from "./FileNativeDownload";
import { FileWebDownloader } from "./FileWebDownload";
import { IFileDownloader } from "../interfaces/IFileDownloader";

export class FileDownloader {
    static createDownloader(): IFileDownloader {
        return typeof window !== "undefined"
            ? new FileWebDownloader()
            : new FileNativeDownloader();
    }
}

import { FileUploaderNative } from "./FileNativeUploader";
import { FileUploaderWeb } from "./FileWebUploader";
import { IFileUploader } from "../interfaces/IFileUploader";
export class FileUploader {
    static createUploader(publisherUrl: string, aggregatorUrl: string): IFileUploader {
        return typeof window !== "undefined"
            ? new FileUploaderWeb(publisherUrl, aggregatorUrl)
            : new FileUploaderNative(publisherUrl, aggregatorUrl);
    }
}



import { IFolderUploader } from "../interfaces/IFolderUploader";
import { FolderUploaderWeb } from "./FolderUploadWeb";
import { FolderUploaderNative } from "./FolderUploadNative";
import { FileUploaderWeb, FileUploaderNative } from "../../file-manager";

export class FolderUploader {
  static createUploader(publisherUrl: string, aggregatorUrl: string, password?: string): IFolderUploader {
    if (typeof window !== "undefined") {
      const fileUploader = new FileUploaderWeb(publisherUrl, aggregatorUrl);
      return new FolderUploaderWeb(fileUploader, password);
    } else {
      const fileUploader = new FileUploaderNative(publisherUrl, aggregatorUrl);
      return new FolderUploaderNative(fileUploader, password);
    }
  }
}

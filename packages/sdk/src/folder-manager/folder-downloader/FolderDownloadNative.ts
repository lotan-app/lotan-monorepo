import { BaseFolderDownloader } from "./BaseFolderDownloader";
import { NativePathAdapter } from "./NativePathAdapter";
import { FileNativeDownloader } from "../../file-manager";
import { NativeFolderDownloadResumeHandler } from "../resume/resume-download/NativeFolderDownloadResumeHandler";
export class FolderDownloadNative extends BaseFolderDownloader<string> {
  constructor() {
    super(new FileNativeDownloader(),new NativeFolderDownloadResumeHandler(), new NativePathAdapter());
  }
}
import { BaseFolderDownloader } from "./BaseFolderDownloader";
import { WebPathAdapter } from "./WebPathAdapter";
import { FileWebDownloader } from "../../file-manager";
import { WebFolderDownloadResumeHandler } from "../resume/resume-download/WebFolderDownloadResumeHandler";
export class FolderDownloadWeb extends BaseFolderDownloader<FileSystemDirectoryHandle> {
  constructor() {
    super(new FileWebDownloader(),new WebFolderDownloadResumeHandler(), new WebPathAdapter());
  }
}
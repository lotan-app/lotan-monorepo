import { BaseFileDownloader } from "./BaseFileDownloader";
import { NativeFileHandler } from "../file-handler/NativeFileHandler";
import { NativeDownloadResumeHandler } from "../resume/resume-download/NativeDownloadResume";
import { NativeFsOverride } from "../../lib/NativeFSOverride";

export class FileNativeDownloader extends BaseFileDownloader {
    constructor() {
        const maxWorkers = Math.max(1,NativeFsOverride.os.cpus().length +2)
        super(
            new NativeFileHandler(),
            new NativeDownloadResumeHandler(),
            maxWorkers
        );
    }
    protected async finalizeDownload(): Promise<void> {
        console.log("No finalization required for native file handling.");
    }
}



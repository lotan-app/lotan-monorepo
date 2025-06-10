import { BaseFileUploader } from './BaseFileUploader';
import { NativeFileHandler } from '../file-handler/NativeFileHandler';
import { NativeResumeHandler } from '../resume/resume-upload/NativeResumeHandler';
import { NativeFsOverride} from '../../lib/NativeFSOverride';
export class FileUploaderNative extends BaseFileUploader<string> {
  constructor(publisherUrl: string, aggregatorUrl: string) {
    const maxWorkers = Math.max(1, NativeFsOverride.os.cpus().length );
    super(
      new NativeFileHandler(),
      new NativeResumeHandler(),
      publisherUrl,
      aggregatorUrl,
      maxWorkers,
    );
  }

  public getFileName(file: string): string {
    return file.split('/').pop() || 'unknown_file';
  }

}

import { NativeFsOverride } from '../../lib/NativeFSOverride';
import { BaseFolderUploader } from '../folder-uploader/BaseUploadFolder';
import { FileUploaderNative } from '../../file-manager';
import { FolderFileEntry } from '../interfaces/FolderFileEntry';
import { IFolderUploadResult } from '../interfaces/IFolderUploadResult';
import { NativeFolderResumeHandler } from '../resume/resume-upload/NativeFolderResumeHandler';
export class FolderUploaderNative extends BaseFolderUploader<string> {
  constructor(
    uploader: FileUploaderNative,
    password?: string
  ) {
    super(uploader, new NativeFolderResumeHandler(),password);
  }

  async uploadFolderWithPassword(folderHandle: string, password: string): Promise<IFolderUploadResult> {
    this.password = password;
    const folderName = NativeFsOverride.path.basename(folderHandle); 
    return this.uploadFolderFromPath(folderHandle,folderName);
  }

  async uploadFolderWithoutPassword(folderHandle: string): Promise<IFolderUploadResult> {
    this.password = undefined;
    const folderName = NativeFsOverride.path.basename(folderHandle); 
    return this.uploadFolderFromPath(folderHandle,folderName);
  }

  private async uploadFolderFromPath(folderHandle: string,folderName: string): Promise<IFolderUploadResult> {
    const fileEntries: FolderFileEntry<string>[] = [];

    const walk = (dir: string) => {
      const entries = NativeFsOverride.fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = NativeFsOverride.path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else {
          const relativePath = NativeFsOverride.path.relative(folderHandle, fullPath);
          fileEntries.push({ file: fullPath, relativePath });
        }
      }
    };

    walk(folderHandle);
    return this.uploadFolderFiles(fileEntries,folderName);
  }
}

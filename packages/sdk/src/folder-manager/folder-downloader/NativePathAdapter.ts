import { NativeFsOverride } from "../../lib/NativeFSOverride";
import { IPathAdapter } from "../interfaces/IPathAdapter";

export class NativePathAdapter implements IPathAdapter<string> {
  async createRootFolder(destination: string, folderName: string): Promise<string> {
    const root = NativeFsOverride.path.join(destination, folderName);
    await NativeFsOverride.fs.promises.mkdir(root, { recursive: true });
    return root;
  }

  async createFileHandle(root: string, relativePath: string): Promise<string> {
    const fullPath = NativeFsOverride.path.join(root, relativePath);
    const dir = NativeFsOverride.path.dirname(fullPath);
    await NativeFsOverride.fs.promises.mkdir(dir, { recursive: true });
    return fullPath;
  }
}
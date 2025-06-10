import { NativeFsOverride } from "./NativeFSOverride";
export class Compressor {
  private async checkType(path: string): Promise<'dir' | 'file'> {
    const stat = await NativeFsOverride.fs.statSync(path)
  
    if (stat.isFile()) {
      return 'file';
    }

    return 'dir';
  }

  async compress(inputPath: string, outputPath: string) {
    const output = NativeFsOverride.fs.createWriteStream(outputPath);

    const archive = NativeFsOverride.archiver('zip', {
      zlib: { level: 9 }

    });

    output.on('close', function () {
      console.log(`File ZIP had been created with size: ${archive.pointer()} bytes.`);
    });

    archive.on('error', function (err) {
      throw err;
    });

    archive.pipe(output);

    const type = await this.checkType(inputPath);

    if (type === 'dir') {
      archive.directory(inputPath, false);
    } else {
      const fileName = inputPath.split(/[/\\]/).pop();
      archive.file(inputPath, { name: fileName });
    }

    archive.finalize();
  }

  async decompress(fileZippedPath: string, outputPath: string) {
    await NativeFsOverride.fs
      .createReadStream(fileZippedPath)
      .pipe(NativeFsOverride.unzipper.Extract({ path: outputPath }))
      .promise();
  }
}

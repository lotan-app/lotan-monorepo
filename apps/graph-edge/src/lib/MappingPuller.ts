import { Compressor, FileManager } from 'packages/sdk/dist/src';
import * as fs from 'fs';

export class MappingPuller {
  constructor(
    private readonly compressor: Compressor,
    private readonly fileManager: FileManager,
    private readonly config: {
      subgraphUrl: string;
      mappingDirPath: string;
    },
  ) {}

  async pullMapping() {
    const subgraphMappingPath = 'subgraph.zip';
    await this.fileManager.downloadFile(this.config.subgraphUrl, subgraphMappingPath);
    await this.compressor.decompress(subgraphMappingPath, this.config.mappingDirPath);
    fs.unlinkSync(subgraphMappingPath);
  }
}

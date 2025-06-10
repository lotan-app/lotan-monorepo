import { Command, Config } from '@oclif/core';
import typescript from '@rollup/plugin-typescript';
import * as fs from 'fs';
import { OutputOptions, rollup, RollupOptions } from 'rollup';
// import { compressor } from '../../helpers/compressor';
// import { fileManager } from '../../helpers/fileManager';
// import { deployEdge } from '../../helpers/deployEdge';
export default class GraphDeploy extends Command {
  constructor(argv: string[], config: Config) {
    super(argv, config);
  }

  static override description = 'Deploy graph to edge';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  public async run(): Promise<void> {
    const currentFolder = process.cwd();
    await this.bundle(
      {
        input: [currentFolder + '/src/mappings.ts'],
        plugins: [typescript()],
      },
      {
        file: './dist/bundle.js',
        format: 'cjs',
      },
    );
    fs.copyFileSync(currentFolder + '/schema.prisma', currentFolder + '/dist/schema.prisma');
    fs.copyFileSync(currentFolder + '/config.yaml', currentFolder + '/dist/config.yaml');

    // const zipOutputPath = './dist.zip';

    // await compressor.compress('./dist', zipOutputPath);

    // const { url } = await fileManager.uploadFile(zipOutputPath);

    // call api to grap-be to deploy new edge
    // console.log(url);
    // const data = await deployEdge(url, 'apiKeyTest');
    // console.log(data);
  }

  async bundle(inputOptions: RollupOptions, outputOptions: OutputOptions) {
    let bundle;
    try {
      bundle = await rollup(inputOptions);
      await bundle.write(outputOptions);
    } catch (error) {
      console.error(error);
    }
  }
}

import * as fs from 'fs';
import { runCommand } from './helpers/runCommand';
import { ILogger } from './types/ILogger';
import { Compressor, FileManager } from 'packages/sdk/dist/src';

export class InitialDb {
  constructor(
    private readonly logger: ILogger,
    private readonly compressor: Compressor,
    private readonly fileManager: FileManager,
    private readonly config: {
      prismaDirPath: string;
      prismaBaseContents: string;
      mappingDirPath: string;
      backupDbUrl: string;
      dbFileName: string;
      prismaFileName: string;
    },
  ) {}

  async handleInitialDb() {
    this.logger.info('Create prisma dir');
    fs.mkdirSync(this.config.prismaDirPath, { recursive: true });

    this.logger.info('Concat prisma file');
    this.concatPrisma();

    // prisma generate
    this.logger.info('Generate prisma client');
    await runCommand(`cd ${process.cwd()} && npx prisma@5.18.0 generate`, 'Generate Prisma Client');

    if (!this.config.backupDbUrl) {
      // run prisma migrations
      this.logger.info('Migrate prisma database');
      await runCommand(`cd ${process.cwd()} && npx prisma@5.18.0 migrate dev --name init`, 'Migrate db');

      return;
    }

    this.logger.info('Restore database');
    await this.restoreDb();
  }

  private concatPrisma() {
    const subgraphPrismaFile = fs.readFileSync(`${this.config.mappingDirPath}/${this.config.prismaFileName}`, 'utf8');
    const subgraphPrismaContents = subgraphPrismaFile.toString();

    const newPrisma = `${this.config.prismaBaseContents}\n\n${subgraphPrismaContents}`;
    fs.writeFileSync(`${this.config.prismaDirPath}/${this.config.prismaFileName}`, newPrisma);
  }

  private async restoreDb() {
    // download backup file
    const backupDbFilePath = './db.zip';
    await this.fileManager.downloadFile(this.config.backupDbUrl, backupDbFilePath);
    // decompress
    await this.compressor.decompress(backupDbFilePath, `${this.config.prismaDirPath}`);

    fs.unlinkSync(backupDbFilePath);
  }
}

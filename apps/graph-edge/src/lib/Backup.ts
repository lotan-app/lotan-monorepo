import { Compressor, FileManager } from '@lotan/sdk';
import fs from 'fs';
import { ILogger } from './types/ILogger';

export class Backup {
  constructor(
    private readonly logger: ILogger,
    private readonly compressor: Compressor,
    private readonly fileManager: FileManager,
    private readonly config: {
      dbResourcePath: string;
      edgeId: string;
      agentUrl: string;
      systemAccessToken: string;
    },
  ) {}

  async handleBackupData() {
    const zipDestinationPath = `db.zip`;

    this.logger.info('Start compress database');
    await this.compressor.compress(this.config.dbResourcePath, zipDestinationPath);
    this.logger.info('Done compress database');
    this.logger.info('Start upload backup database');
    const { url } = await this.fileManager.uploadFile(zipDestinationPath);
    this.logger.info(`Done upload backup database: ${url}`);

    this.logger.info('Start remove backup file in local');
    fs.unlinkSync(zipDestinationPath);
    this.logger.info('Done remove backup file in local');

    this.logger.info('Start request to agent to save backup url');
    await this.sendBackupUrl(url);
    this.logger.info('Done request to agent to save backup url');
  }

  private async sendBackupUrl(backupUrl: string) {
    const res = await fetch(`${this.config.agentUrl}/edge/update-backup-db-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.systemAccessToken}`,
      },
      body: JSON.stringify({
        edgeId: this.config.edgeId,
        backupUrl,
      }),
    });

    if (!res.ok) {
      throw new Error('FETCH_TO_AGENT_TO_BACKUP_DB_FAILED');
    }
  }
}

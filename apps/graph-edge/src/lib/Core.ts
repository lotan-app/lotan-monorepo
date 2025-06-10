import { SuiClient } from '@mysten/sui/client';
import { CheckpointFetcher } from './CheckpointFetcher';
import { Mapping } from './Mapping';
import { Store } from './Store';
import { WorkerPool } from './WorkerPool';
import { ICheckpoint } from './types/ICheckpoint';
import { ILogger } from './types/ILogger';
import { delay } from './utils/delay';
import { Backup } from './Backup';
import { executePromise } from './utils/executePromise';
import * as cron from 'node-cron';
export interface ICoreOptions {
  startCheckpoint: number;
  maxQuantityCheckpointsHaveBeenPrepared: number;
  backupDbCronExpression?: string;
}

export class Core {
  private isRunning: boolean;
  private nextCheckpoint: number;
  private currentCheckpointHasBeenProcessed: number;
  private maxQuantityCheckpointsHaveBeenPrepared: number;
  private checkpointsHaveBeenPrepared: Map<number, ICheckpoint>;
  private onchainLatestCheckpoint: number;
  private checkpointNumberProcessedPerPeriod: number;
  private isEnablePersistData: boolean;
  private backupDbCronExpression: string;

  constructor(
    private readonly logger: ILogger,
    private readonly store: Store,
    private readonly workerPool: WorkerPool,
    private readonly checkpointFetcher: CheckpointFetcher,
    private readonly suiClient: SuiClient,
    private readonly mapping: Mapping,
    private readonly backup: Backup,
    options: ICoreOptions,
  ) {
    this.isRunning = false;
    this.nextCheckpoint = options.startCheckpoint;
    this.currentCheckpointHasBeenProcessed = this.nextCheckpoint - 1;
    this.maxQuantityCheckpointsHaveBeenPrepared = options.maxQuantityCheckpointsHaveBeenPrepared;
    this.checkpointsHaveBeenPrepared = new Map();
    this.checkpointNumberProcessedPerPeriod = 0;
    this.isEnablePersistData = true;
    this.backupDbCronExpression = options.backupDbCronExpression || '0 * * * *';
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.logger.info('Core started');

    this.isRunning = true;

    await this.refreshOnchainLatestCheckpoint();

    this.loopRefreshOnchainLatestCheckpoint();
    this.prepareCheckpoints();
    this.providerEvents();
    this.logAverageCheckpoint();
    this.cronBackupDb(this.backupDbCronExpression);
  }

  private async logAverageCheckpoint() {
    const period = 30;

    while (true) {
      await delay(period * 1000);
      this.logger.info(
        `next_checkpoint: ${this.currentCheckpointHasBeenProcessed + 1} - checkpoints_processed_per_second: ${Math.ceil(
          this.checkpointNumberProcessedPerPeriod / period,
        )}`,
      );
      this.checkpointNumberProcessedPerPeriod = 0;
    }
  }

  private async refreshOnchainLatestCheckpoint() {
    try {
      const latestCheckpoint = await this.suiClient.getLatestCheckpointSequenceNumber();
      this.onchainLatestCheckpoint = Number(latestCheckpoint);
    } catch (error) {
      this.logger.error(`Error on refreshOnchainLatestCheckpoint: ${error.message}`);
    } finally {
      await delay(200);
    }
  }

  private async loopRefreshOnchainLatestCheckpoint() {
    while (true) {
      await this.refreshOnchainLatestCheckpoint();
      await delay(200);
    }
  }

  private async prepareCheckpoints() {
    while (true) {
      if (this.nextCheckpoint > this.onchainLatestCheckpoint) {
        await delay(100);
        continue;
      }

      if (
        this.nextCheckpoint - 1 >=
        this.currentCheckpointHasBeenProcessed + this.maxQuantityCheckpointsHaveBeenPrepared
      ) {
        await delay(100);
        continue;
      }

      this.workerPool.runTask(
        this.nextCheckpoint,
        this.checkpointFetcher.fetchCheckpoint.bind(this.checkpointFetcher),
        (checkpoint: ICheckpoint, error: Error) => {
          if (error) {
            console.error('Fetch checkpoint error:', error);
            throw error;
          }

          this.checkpointsHaveBeenPrepared.set(checkpoint.checkpoint, checkpoint);
        },
      );

      this.nextCheckpoint++;
    }
  }

  private async providerEvents() {
    while (true) {
      const nextCheckpoint = this.currentCheckpointHasBeenProcessed + 1;
      const checkpointData = this.checkpointsHaveBeenPrepared.get(nextCheckpoint);

      if (!checkpointData) {
        await delay(1000);
        continue;
      }

      const { transactions } = checkpointData as ICheckpoint;

      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];

        for (let j = 0; j < transaction.events.length; j++) {
          const event = transactions[i].events[j];
          await this.mapping.processEvent(event);
        }
      }

      this.checkpointNumberProcessedPerPeriod++;

      this.checkpointsHaveBeenPrepared.delete(nextCheckpoint);
      this.currentCheckpointHasBeenProcessed++;

      // persist data
      if (this.checkNeedPersistData()) {
        await this.store.persistData(this.currentCheckpointHasBeenProcessed);
        // this.logger.info(`System have saved ${quantityRowsAreSaved} rows`)
      }
    }
  }

  getCurrentCheckpointHasBeenProcessed(): number {
    return this.currentCheckpointHasBeenProcessed;
  }

  private getCheckpointPersistentQuantity(): number {
    let pole = 1000;

    if (this.onchainLatestCheckpoint - this.currentCheckpointHasBeenProcessed < 20) {
      pole = 4;
    }

    return pole;
  }

  private checkNeedPersistData(): boolean {
    if (!this.isEnablePersistData) {
      return false;
    }

    const checkpointPersistentQuantity = this.getCheckpointPersistentQuantity();

    if (this.currentCheckpointHasBeenProcessed % checkpointPersistentQuantity !== 0) {
      return false;
    }

    return true;
  }

  private async handleBackupDb() {
    this.logger.info('Start backup database');
    this.isEnablePersistData = false;

    const [error] = await executePromise(this.backup.handleBackupData());

    if (error) {
      this.logger.info(`Error during backup data: ${error}`);
    }

    this.isEnablePersistData = true;
    this.logger.info('End backup database');
  }

  private async cronBackupDb(cronExpression: string) {
    cron.schedule(cronExpression, async () => {
      await this.handleBackupDb();
    });
  }
}

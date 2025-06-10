import { SuiCheckpointReader } from '@lotan/sui-checkpoint-reader';
import { coreConfig } from '../config/coreConfig';
import { Backup } from './Backup';
import { CheckpointFetcher } from './CheckpointFetcher';
import {
  CHECKPOINT_ENTITY,
  dbFileName,
  NEXT_CHECKPOINT_ID,
  prismaDirPath,
  subgraphConfigPath,
  mappingDirPath,
  prismaBaseContents,
  prismaFileName,
} from './constant';
import { Core } from './Core';
import { env } from './env';
import { Hashing } from './Hashing';
import { getSubgraphConfig } from './helpers/getSubgraphConfig';
import { Logger } from './Logger';
import { Mapping } from './Mapping';
import { PrismaClientDatabase } from './PrismaClientDatabase';
import { Store } from './Store';
import { SuiClientProvider } from './SuiClientProvider';
import { TokenManager } from './TokenManager';
import { Checkpoint } from './types/Checkpoint';
import { IStore } from './types/IStore';
import { Network } from './types/Network';
import { compressor } from './utils/compressor';
import { delay } from './utils/delay';
import { executePromise } from './utils/executePromise';
import { fileManager } from './utils/fileManager';
import { WorkerPool } from './WorkerPool';
import { InitialEssentialPackages } from './InitialEssentialPackages';
import { InitialDb } from './InitialDb';
import { MappingPuller } from './MappingPuller';

export class CoreCreator {
  constructor(private readonly network: Network) {}

  async createCore(): Promise<Core> {
    const config = coreConfig[this.network];

    const maxQuantityCheckpointsHaveBeenPrepared = config.maxQuantityCheckpointsHaveBeenPrepared;
    const totalWorkers = config.totalWorkers;

    const logger = new Logger('CoreCreator');

    const suiClientProvider = new SuiClientProvider(new Logger('SuiClient'), config.rpcFullnodes);
    const suiClient = await suiClientProvider.getProvider();

    // prepare data

    const mappingPuller = new MappingPuller(compressor, fileManager, {
      subgraphUrl: env.subgraphUrl,
      mappingDirPath,
    });

    logger.info('Pull mapping');
    await mappingPuller.pullMapping();

    const initialEssentialPackages = new InitialEssentialPackages(suiClient, {
      beUrl: env.beUrl,
      essentialPackagesDestinationPath: 'essentialPackages.json',
      subgraphConfigPath,
      systemAccessToken: env.systemAccessToken,
    });

    logger.info('Initial Essential Packages');
    await initialEssentialPackages.handleInitialEssentialPackages();

    const initialDb = new InitialDb(new Logger('InitialDb'), compressor, fileManager, {
      backupDbUrl: env.backupDbUrl,
      dbFileName: dbFileName,
      prismaDirPath,
      mappingDirPath,
      prismaBaseContents,
      prismaFileName,
    });

    logger.info('Initial Db');
    await initialDb.handleInitialDb();

    const subgraphConfig = getSubgraphConfig(subgraphConfigPath);

    const startCheckpoint = subgraphConfig.startCheckpoint;
    const mappingConfig = subgraphConfig.mappings;
    const whitelistEventTypes = mappingConfig.map(item => item.type);

    const tokenManager = new TokenManager(suiClient);
    const hashing = new Hashing();

    const prismaClientDb = new PrismaClientDatabase();
    await prismaClientDb.initPrisma();
    const store = new Store(prismaClientDb);
    const reader = await SuiCheckpointReader.newWithConfig({
      remoteStoreBaseUri: config.remoteStoreBaseUri,
    });

    const checkpointFetcher = new CheckpointFetcher(reader, whitelistEventTypes);

    const workerPool = new WorkerPool(totalWorkers);

    let nextCheckpoint = await this.getNextCheckpoint(store);

    if (!nextCheckpoint) {
      nextCheckpoint = {
        id: NEXT_CHECKPOINT_ID,
        checkpoint: startCheckpoint,
      };

      store.save(CHECKPOINT_ENTITY, nextCheckpoint);
    }

    const mapping = new Mapping(store, tokenManager, hashing);

    const backup = new Backup(new Logger('Backup'), compressor, fileManager, {
      dbResourcePath: `${prismaDirPath}/${dbFileName}`,
      agentUrl: env.agentUrl,
      edgeId: env.edgeId,
      systemAccessToken: env.systemAccessToken,
    });

    return new Core(new Logger('Core'), store, workerPool, checkpointFetcher, suiClient, mapping, backup, {
      startCheckpoint: nextCheckpoint.checkpoint,
      maxQuantityCheckpointsHaveBeenPrepared,
    });
  }

  private async getNextCheckpoint(store: IStore): Promise<Checkpoint> {
    const [error, nextCheckpoint] = await executePromise(
      store.loadData<Checkpoint>(CHECKPOINT_ENTITY, NEXT_CHECKPOINT_ID),
    );

    if (error) {
      await delay(100);
      return this.getNextCheckpoint(store);
    }

    return nextCheckpoint;
  }
}

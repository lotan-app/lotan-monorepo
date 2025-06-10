import * as path from 'path';

import * as dotenv from 'dotenv';

import { getOsEnv, getOsEnvOptional } from './utils';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config({
  path: path.join(process.cwd(), `.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`),
});

/**
 * Environment variables
 */
export const env = {
  edgeId: getOsEnv('EDGE_ID'),
  subgraphUrl: getOsEnv('SUBGRAPH_URL'),
  app: {
    port: Number(getOsEnvOptional('APP_PORT') || 8080),
  },
  beUrl: getOsEnv('BE_URL'),
  systemAccessToken: getOsEnv('SYSTEM_ACCESS_TOKEN'),
  mainnet: {
    remoteStoreBaseUri:
      getOsEnvOptional('MAINNET_REMOTE_STORE_BASE_URI') || 'https://storage.googleapis.com/mysten-mainnet-checkpoints',
  },
  testnet: {
    remoteStoreBaseUri:
      getOsEnvOptional('TESTNET_REMOTE_STORE_BASE_URI') || 'https://storage.googleapis.com/mysten-testnet-checkpoints',
  },
  agentUrl: getOsEnv('AGENT_URL'),
  backupDbUrl: getOsEnvOptional('BACKUP_DB_URL') || '',
};

import { getFullnodeUrl } from '@mysten/sui/client';
import { env } from '../lib/env';

export const coreConfig = {
  mainnet: {
    remoteStoreBaseUri: env.mainnet.remoteStoreBaseUri,
    fullnodeUrl: getFullnodeUrl('mainnet'),
    maxQuantityCheckpointsHaveBeenPrepared: 10000,
    totalWorkers: 50,
    rpcFullnodes: [getFullnodeUrl('mainnet')],
  },
  testnet: {
    remoteStoreBaseUri: env.testnet.remoteStoreBaseUri,
    fullnodeUrl: getFullnodeUrl('testnet'),
    maxQuantityCheckpointsHaveBeenPrepared: 10000,
    totalWorkers: 50,
    rpcFullnodes: [getFullnodeUrl('testnet')],
  },
};

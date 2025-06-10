import { IMappingConfig } from './IMappingConfig';
import { Network } from './Network';

export interface ISubgraphConfig {
  network: Network;
  startCheckpoint: number;
  mappings: IMappingConfig[];
}

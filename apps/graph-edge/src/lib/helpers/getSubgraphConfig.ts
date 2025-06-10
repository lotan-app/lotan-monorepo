import * as fs from 'fs';
import yaml from 'js-yaml';
import { ISubgraphConfig } from '../types/ISubgraphConfig';

export const getSubgraphConfig = (configPath: string): ISubgraphConfig => {
  const configFile = fs.readFileSync(configPath, 'utf8');

  if (!configFile) {
    throw new Error(`Could not read config file: ${configPath}`);
  }

  const config: ISubgraphConfig = yaml.load(configFile);

  return config;
};

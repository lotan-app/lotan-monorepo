import * as path from 'path';

import * as dotenv from 'dotenv';

import { getOsEnv, getOsEnvOptional, getOsPaths, normalizePort, toArray, toBool, toNumber } from './utils';

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
  node: process.env.NODE_ENV || 'local',
  isProduction: process.env.NODE_ENV === 'prod',
  isStg: process.env.NODE_ENV === 'stg',
  isDev: process.env.NODE_ENV === 'dev',
  isLocal: process.env.NODE_ENV === 'local' || !process.env.NODE_ENV,
  serverType: process.env.SERVER_TYPE || 'producer', //server type include "producer, worker"
  jobDefinitions: toArray(getOsEnv('JOB_DEFINITIONS')),
  cronDefinitions: toArray(getOsEnv('CRON_DEFINITIONS')),
  botDefinitions: toArray(getOsEnv('BOT_DEFINITIONS')),
  systemAccessToken: getOsEnv('SYSTEM_ACCESS_TOKEN'),
  app: {
    name: getOsEnv('APP_NAME'),
    host: getOsEnv('APP_HOST'),
    externalPort: getOsEnv('APP_EXTERNAL_PORT'),
    schema: getOsEnv('APP_SCHEMA'),
    routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
    beRoutePrefix: getOsEnv('APP_BE_ROUTE_PREFIX'),
    port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
  },
  log: {
    level: getOsEnv('LOG_LEVEL'),
    json: toBool(getOsEnvOptional('LOG_JSON')),
  },
  jwt: {
    publicKey: getOsEnv('JWT_PUBLIC_KEY'),
    privateKey: getOsEnv('JWT_PRIVATE_KEY'),
  },
  swagger: {
    enabled: toBool(getOsEnv('SWAGGER_ENABLED')),
    route: getOsEnv('SWAGGER_ROUTE'),
    apiDocs: getOsEnv('SWAGGER_API_DOCS'),
  },
  mongodb: {
    uri: getOsEnv('MONGODB_URI'),
    packageUri: getOsEnv('MONGODB_PACKAGE_URI'),
    packageDbName: getOsEnv('MONGODB_PACKAGE_DB_NAME'),
  },
  redis: {
    nodes: getOsEnv('REDIS_NODES') || '',
    db: getOsEnvOptional('REDIS_DB') ? Number(getOsEnvOptional('REDIS_DB')) : 0,
    defaultExpirationTimeInSeconds: toNumber(getOsEnv('REDIS_DEFAULT_EXPIRATION_TIME_IN_SECONDS')) || 24 * 60 * 60, //1 days
  },
  periodPingMs: toNumber(getOsEnv('PERIOD_PING_MS')) || 2000000,
  edgeConfig: {
    portRange: {
      start: toNumber(getOsEnvOptional('EDGE_PORT_RANGE_START')) || 4000,
      end: toNumber(getOsEnvOptional('EDGE_PORT_RANGE_END')) || 5000,
    },
    limitCpu: getOsEnvOptional('EDGE_CONFIG_LIMIT_CPU') || '.5',
    limitMem: getOsEnvOptional('EDGE_CONFIGI_LIMIT_MEM') || '500mb',
  },
};

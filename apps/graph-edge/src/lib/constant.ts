import { env } from './env';

// const rootDir = path.resolve(__dirname)
export const rootDir = process.cwd();

export const CHECKPOINT_ENTITY = 'checkpoint';
export const NEXT_CHECKPOINT_ID = 'next_checkpoint';
export const VALID_RESOLVER_REGEX = /^(?!(Create|Update|Upsert|Delete))((?!Crud).)*Resolver$/;

export const zipFileDownloadUrl = env.subgraphUrl;
export const zipFileDestination = `${rootDir}/subgraph.zip`;
export const mappingDirPath = `${rootDir}/mappings`;
export const bundlePath = `${mappingDirPath}/bundle.js`;
export const subgraphConfigPath = `${mappingDirPath}/config.yaml`;

export const prismaDirPath = `${rootDir}/prisma`;
export const dbFileName = 'db.db';
export const prismaFileName = 'schema.prisma';

export const walrusPublisherUrl = 'https://publisher.walrus-testnet.walrus.space/v1/store?epochs=5';
export const walrusDownloadUrl = 'https://aggregator.walrus-testnet.walrus.space/v1';

export const prismaBaseContents = `generator client {
    provider = "prisma-client-js"
  }
  
  generator typegraphql {
    provider            = "typegraphql-prisma"
    formatGeneratedCode = "prettier"
  }
  
  datasource db {
    provider = "sqlite"
    url      = "file:./${dbFileName}"
  }
  
  model Checkpoint {
    id         String @id
    checkpoint Int
  }`;

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { buildSchema } from 'type-graphql';
import { CoreCreator } from './lib/CoreCreator';
import { env } from './lib/env';
import { getResolvers } from './lib/helpers/getResolvers';
import { Logger } from './lib/Logger';
import { ValidateTakeArgMiddleware } from './middleware/ValidateTakeArgMiddleware';

async function bootstrap() {
  const logger = new Logger('Main');

  try {
    const coreCreator = new CoreCreator('mainnet');

    const core = await coreCreator.createCore();
    core.start();

    const resolvers = await getResolvers();

    const schema = await buildSchema({
      resolvers,
      validate: false,
      globalMiddlewares: [ValidateTakeArgMiddleware],
    });

    const { PrismaClient } = await import('@prisma/client');

    const prisma = new PrismaClient();

    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      schema, // from previous step
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();

    app.get('/health', (req, res) => {
      res.json({ message: 'OK' });
    });

    app.use(cors(), bodyParser.json(), expressMiddleware(server, { context: async () => ({ prisma }) }));

    httpServer.listen({ port: env.app.port }, () => {
      logger.info(`🚀 Server ready at port: ${env.app.port}`);
    });
  } catch (error) {
    logger.info(error.message);
    throw error;
  }
}

bootstrap();

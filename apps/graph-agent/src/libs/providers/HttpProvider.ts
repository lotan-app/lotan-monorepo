import { createServer, Server } from 'http';

import express, { Express } from 'express';
import helmet from 'helmet';
import { useContainer, useExpressServer } from 'routing-controllers';
import { Container, Inject, Service } from 'typedi';

import { AuthenticationMiddleware } from 'src/middlewares/rest/AuthenticationMiddleware';
import { ErrorHandlerMiddleware } from 'src/middlewares/rest/ErrorHandlerMiddleware';
import { HasAPIKey } from 'src/middlewares/rest/HasAPIKey';
import { LogAccessMiddleware } from 'src/middlewares/rest/LogAccessMiddleware';
import { RequestClosureMiddleware } from 'src/middlewares/rest/RequestClosureMiddleware';
import { EdgeController } from 'src/rests/controllers/EdgeController';
import { Logger } from '../../decorators/Logger';
import { appEvent } from '../appEvent';
import { RestRoles } from '../enums/RestRoles';
import { env } from '../env';
import { ServerType } from '../env/ServerType';
import { swaggerSetup } from '../swagger';
import { ILogger } from '../types/ILogger';
import Provider from './Provider';

@Service()
export default class HttpProvider extends Provider {
  private expressApp: Express;
  private httpServer: Server;

  constructor(@Inject('rootPath') private readonly rootPath: string, @Logger(module.filename) private logger: ILogger) {
    super();
  }

  async register(): Promise<void> {
    this.expressApp = express();
    this.httpServer = createServer(this.expressApp);
    Container.set('express', this.expressApp);
    Container.set('httpServer', this.httpServer);
    useContainer(Container);
  }

  async boot(): Promise<void> {
    this.expressApp.get('/', (req, res) => {
      return res.send('Hello there');
    });
    this.expressApp.get('/health', (req, res) => {
      return res.send('Healthy');
    });
    const cspDefaults = helmet.contentSecurityPolicy.getDefaultDirectives();
    delete cspDefaults['upgrade-insecure-requests'];
    this.expressApp.use(
      helmet({
        contentSecurityPolicy: {
          directives: cspDefaults,
        },
      }),
    );
    useExpressServer(this.expressApp, {
      cors: true,
      classTransformer: true,
      classToPlainTransformOptions: {
        excludePrefixes: ['_'],
      },
      validation: {
        skipMissingProperties: false,
      },
      routePrefix: env.app.routePrefix || '/api',
      defaultErrorHandler: false,
      controllers: [EdgeController],
      middlewares: [
        AuthenticationMiddleware,
        ErrorHandlerMiddleware,
        HasAPIKey,
        LogAccessMiddleware,
        RequestClosureMiddleware,
      ],
      interceptors: [],
      authorizationChecker: async (action, roles: RestRoles[]) => {
        if (!(action.request as any).identity) {
          return false;
        }
        if (roles && roles.length) {
          const r: string[] = (action.request as any).roles || [];
          if (!roles.find(role => r.indexOf(role.toString()) !== -1)) {
            return false;
          }
        }
        return true;
      },
    });

    swaggerSetup(this.expressApp);

    if (ServerType.allowProducerServer()) {
      //start server http
      this.httpServer.listen(env.app.port, () => {
        appEvent.emit('server_started', env.app.port);
      });
    }
  }

  async close() {
    this.logger.info('Closing http server.');
    return new Promise((resolve, reject) => {
      this.httpServer.close(async () => {
        this.logger.info('Http server closed.');
        resolve(null);
      });
    });
  }
}

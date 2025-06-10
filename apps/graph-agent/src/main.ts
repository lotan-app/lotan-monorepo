import 'reflect-metadata';
import { Container, Service } from 'typedi';
import { Logger } from './decorators/Logger';
import { ILogger } from './libs/types/ILogger';
import { appEvent } from './libs/appEvent';
import { Kernel } from './libs/Kernel';
import Provider from './libs/providers/Provider';

@Service()
class MainApplication {
  constructor(@Logger(module.filename) private readonly logger: ILogger) {}
  public async bootstrap() {
    Container.set('rootPath', __dirname);

    try {
      const providers = Kernel.providers;
      //register all all provider
      for (const provider of providers) {
        await Container.get<Provider>(provider).register();
      }

      //boot all all provider
      for (const provider of providers) {
        await Container.get<Provider>(provider).boot();
      }

      process.on('uncaughtException', err => {
        this.logger.error(`Uncaught Exception thrown: ${err}`);
        // appEvent.emit('shutdown');
        // process.exit(1);
      });

      const handleClose = async (signal: string) => {
        this.logger.info(`${signal} signal received.`);
        //close all all provider
        const closingProviders = [...providers];
        for (const provider of closingProviders.reverse()) {
          await Container.get<Provider>(provider).close();
        }
        appEvent.emit('process_closed');
      };
      process.on('SIGTERM', handleClose);
      process.on('SIGINT', handleClose);
      appEvent.on('process_closed', () => {
        this.logger.info('Successfully closed process.');
        process.exit(0);
      });
    } catch (err) {
      this.logger.error(`Error occurs during bootstrap: ${err}`);
      appEvent.emit('shutdown');
      throw err;
    }
  }
}

Container.get(MainApplication).bootstrap();

import winston from 'winston';
import { ILogger } from './types/ILogger';
import { env } from './env';

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor(private readonly contextPath: string) {
    this.logger = winston.createLogger({
      level: env.log.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  private convertMessage(message: string): string {
    return `${this.contextPath?.split('/').pop()}: ${message}`;
  }

  info(message: string): void {
    this.logger.info(this.convertMessage(message));
  }

  error(message: string): void {
    this.logger.error(this.convertMessage(message));
  }

  warn(message: string): void {
    this.logger.warn(this.convertMessage(message));
  }

  debug(message: string): void {
    this.logger.debug(this.convertMessage(message));
  }
}

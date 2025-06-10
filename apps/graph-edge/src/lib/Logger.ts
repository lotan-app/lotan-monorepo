import { ILogger } from './types/ILogger';

export class Logger implements ILogger {
  constructor(private readonly prefix = '') {}

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}]${this.prefix ? ` [${this.prefix}]` : ''} ${message}`;
  }

  info(message: string): void {
    console.log(this.formatMessage('INFO', message));
  }

  warn(message: string): void {
    console.warn(this.formatMessage('WARN', message));
  }

  error(message: string): void {
    console.error(this.formatMessage('ERROR', message));
  }

  debug(message: string): void {
    console.debug(this.formatMessage('DEBUG', message));
  }
}

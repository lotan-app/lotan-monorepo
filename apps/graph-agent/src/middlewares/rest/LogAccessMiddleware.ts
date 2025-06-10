import { NextFunction, Request, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import { Logger } from '../../decorators/Logger';
import { ILogger } from '../../libs/types/ILogger';

@Service()
@Middleware({ type: 'before' })
export class LogAccessMiddleware implements ExpressMiddlewareInterface {
  constructor(@Logger(module.filename) private logger: ILogger) {}

  public use(req: Request, res: Response, next: NextFunction): void {
    if (req.path.includes('/graphql')) {
      return next();
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    this.logger.info(`Logging access: from ${ip} -> ${req.method} ${req.path} HTTP/:${req.httpVersion}`);
    return next();
  }
}

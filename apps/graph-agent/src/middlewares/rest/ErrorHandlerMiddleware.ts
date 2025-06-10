import { NextFunction, Request, Response } from 'express';
import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import { Logger } from '../../decorators/Logger';
import { ILogger } from '../../libs/types/ILogger';

@Service()
@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  constructor(@Logger(module.filename) private logger: ILogger) {}

  public error(error: any, req: Request, res: Response, next: NextFunction) {
    console.dir(error, { depth: 10 });
    this.logger.error(`error mdw:: ${error}`);
    return res.status(error.httpCode || 500).json({
      name: error.name,
      message: error.message,
      errors: error.errors,
    });
  }
}

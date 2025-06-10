import { NextFunction, Request, Response } from 'express';
import { BadRequestError, ExpressMiddlewareInterface } from 'routing-controllers';
import { Service } from 'typedi';
import { Logger } from '../../decorators/Logger';
import { ILogger } from '../../libs/types/ILogger';

@Service()
// @Middleware({ type: 'after' })
export class RequestClosureMiddleware implements ExpressMiddlewareInterface {
  constructor(@Logger(module.filename) private logger: ILogger) {}

  public use(req: Request, res: Response, next: NextFunction): void {
    if (req.closed) {
      throw new BadRequestError('Request has been closed.');
    }

    return next();
  }
}

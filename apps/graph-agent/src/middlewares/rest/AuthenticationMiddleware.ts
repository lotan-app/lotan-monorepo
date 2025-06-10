import { NextFunction, Request, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware, UnauthorizedError } from 'routing-controllers';
import { Service } from 'typedi';

import { Logger } from '../../decorators/Logger';
import { env } from '../../libs/env';
import { verify } from '../../libs/helpers/jwt';
import { ILogger } from '../../libs/types/ILogger';
import { WinstonLogger } from '../../libs/WinstonLogger';

const logger = new WinstonLogger('Authenmiddleware');

@Service()
@Middleware({ type: 'before' })
export class AuthenticationMiddleware implements ExpressMiddlewareInterface {
  constructor(@Logger(module.filename) private logger: ILogger) {}

  public use(req: Request, res: Response, next: NextFunction): void {
    if (req.path.includes('/graphql')) {
      return next();
    }
    const [, token] = (req.headers.authorization || '').split(' ');
    if (!token) return next();
    // logger.info('AuthenticationMiddleware:: Token in request: ', token);
    try {
      const data: any = verify(token, env.jwt.publicKey);
      // logger.info('AuthenticationMiddleware:: Decoded token data: ', data);
      (req as any).identity = data.sub;
      (req as any).roles = data['roles'] || [];
      return next();
    } catch (error) {
      logger.error(`AuthenticationMiddleware:: Error verifying token: ${error}`);
      throw new UnauthorizedError();
    }
  }
}

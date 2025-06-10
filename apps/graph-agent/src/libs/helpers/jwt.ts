import jwt from 'jsonwebtoken';
import { WinstonLogger } from '../WinstonLogger';
const logger = new WinstonLogger('jwt');

export const sign = (payload: any, privateBase64: string, expiresIn: any, header: any, issuer?: string) => {
  const priv = Buffer.from(privateBase64, 'base64').toString('utf-8');
  const options: jwt.SignOptions = {
    algorithm: 'RS256',
    encoding: 'UTF-8',
    header,
  };
  if (issuer) options.issuer = issuer;
  if (expiresIn) options.expiresIn = expiresIn;
  const token = jwt.sign(payload, priv, options);
  logger.debug(`generated token: ${token}`);
  return token;
};

export const verify = (token: string, publicBase64: string, options?: jwt.VerifyOptions) => {
  const pub = Buffer.from(publicBase64, 'base64').toString('utf-8');
  return jwt.verify(token, pub, options);
};

export const decode = async (token: string) => jwt.decode(token, { json: true });

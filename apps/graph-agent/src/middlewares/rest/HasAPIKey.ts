import { UnauthorizedError } from 'routing-controllers';

export function HasAPIKey(apiKeys: string[]) {
  return (req: any, res: any, next) => {
    const { apiKey } = req.query;

    //TODO: Need to implement the Key Authorization policy properly
    if (!apiKey || !apiKeys.includes(apiKey)) {
      throw new UnauthorizedError();
    }
    return next();
  };
}

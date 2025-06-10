import { IToken } from './IToken';

export interface ITokenManager {
  getToken(tokenType: string): Promise<IToken>;
}

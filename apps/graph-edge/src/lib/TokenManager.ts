import { SuiClient } from '@mysten/sui/client';
import { IToken } from './types/IToken';

export class TokenManager {
  private tokens: Map<string, IToken> = new Map();

  constructor(private readonly suiClient: SuiClient) {
    this.tokens = new Map();
  }

  private async fetchToken(tokenType: string): Promise<IToken | null> {
    const token = await this.suiClient.getCoinMetadata({
      coinType: tokenType,
    });

    if (!token) {
      return null;
    }

    const { name, decimals, symbol } = token;

    return {
      type: tokenType,
      name,
      decimals,
      symbol,
    };
  }

  async getToken(tokenType: string): Promise<IToken> {
    let token = this.tokens.get(tokenType);

    if (!token) {
      token = (await this.fetchToken(tokenType)) as IToken;

      if (token) {
        this.tokens.set(tokenType, token);
      }
    }

    return token;
  }
}

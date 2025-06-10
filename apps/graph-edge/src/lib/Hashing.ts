import { IHashing } from './types/IHashing';
import crypto from 'crypto';

export class Hashing implements IHashing {
  hashString(input: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
  }
}

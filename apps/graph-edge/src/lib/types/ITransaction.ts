import { IEvent } from './IEvent';

export interface ITransaction<T = any> {
  txDigest: string;
  txIndex: number;
  events: IEvent<T>[];
}

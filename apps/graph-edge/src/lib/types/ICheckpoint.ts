import { ITransaction } from './ITransaction';

export interface ICheckpoint {
  checkpoint: number;
  transactions: ITransaction[];
}

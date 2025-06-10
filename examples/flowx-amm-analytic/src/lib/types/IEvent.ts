export interface IEvent<T = any> {
  eventSeq: number;
  txDigest: string;
  checkpoint: number;
  parsedJson: T;
  sender: string;
  timestamp: number;
  packageId: string;
  transactionModule: string;
  txIndex: number;
  type: string;
}

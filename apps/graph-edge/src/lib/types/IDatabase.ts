import { IPersistentItem } from './IPersistentItem';

export interface IDatabase {
  // create<T>(entity: string, data: T): T
  get<T>(entity: string, id: string | number): Promise<T | undefined>;
  // save<T>(entity: string, data: T): Promise<void>
  persistData(data: IPersistentItem[]): Promise<void>;
}

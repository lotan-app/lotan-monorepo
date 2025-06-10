import { ID } from './ID';

export interface IStore {
  loadData<T>(entity: string, id: ID): Promise<T | null>;
  save<T = any>(entity: string, data: { id: ID } & T): void;
  delete(entity: string, id: ID);
}

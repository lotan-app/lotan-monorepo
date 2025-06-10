import { CHECKPOINT_ENTITY, NEXT_CHECKPOINT_ID } from './constant';
import { ACTION } from './enums/Action';
import { Checkpoint } from './types/Checkpoint';
import { ID } from './types/ID';
import { IDatabase } from './types/IDatabase';
import { IStore } from './types/IStore';
import _ from 'lodash';

export interface IEntity<T> {
  data: T;
  updatedAt: number;
  action: ACTION;
}

type IEntityMap = Map<ID, IEntity<any>>;
type IStoreData = Map<string, IEntityMap>;

export class Store implements IStore {
  private store: IStoreData;

  constructor(private readonly db: IDatabase) {
    this.store = new Map();
  }

  private ensureEntityMap(entity: string): void {
    if (!this.store.has(entity)) {
      this.store.set(entity, new Map());
    }
  }

  private getEntityMap(entity: string): IEntityMap {
    this.ensureEntityMap(entity);

    return this.store.get(entity) as IEntityMap;
  }

  async loadData<T>(entity: string, id: ID): Promise<T | null> {
    const entityMap = this.getEntityMap(entity);

    const entityData = entityMap.get(id);

    if (entityData?.data) {
      return _.cloneDeep(entityData.data);
    }

    const data = await this.db.get<T>(entity, id);

    if (!data) {
      return null;
    }

    entityMap.set(id, {
      data,
      updatedAt: 0,
      action: ACTION.UPDATE,
    });

    return _.cloneDeep(data);
  }

  save<T = any>(entity: string, data: { id: ID } & T): void {
    const entityMap = this.getEntityMap(entity);

    entityMap.set(
      data.id,
      _.cloneDeep({
        data,
        updatedAt: Date.now(),
        action: ACTION.UPDATE,
      }),
    );
  }

  delete(entity: string, id: ID) {
    const entityMap = this.getEntityMap(entity);

    const existingData = entityMap.get(id);

    if (existingData) {
      entityMap.set(id, { ...existingData, action: ACTION.DELETE });
      return;
    }

    entityMap.set(id, { data: null, updatedAt: Date.now(), action: ACTION.DELETE });
  }

  async persistData(currentCheckpoint: number): Promise<{ quantityRowsAreSaved: number }> {
    const itemsAreSaved: {
      entity: string;
      action: ACTION;
      id: ID;
      data: any;
    }[] = [];

    const nextCheckpointData = (await this.loadData<Checkpoint>(CHECKPOINT_ENTITY, NEXT_CHECKPOINT_ID)) as Checkpoint;
    nextCheckpointData.checkpoint = currentCheckpoint + 1;
    this.save(CHECKPOINT_ENTITY, nextCheckpointData);

    this.store.forEach((entityMap, entity) => {
      entityMap.forEach((data, id) => {
        itemsAreSaved.push({
          entity,
          action: data.action,
          id,
          data: data ? _.cloneDeep(data.data) : data,
        });
      });
    });

    if (itemsAreSaved.length > 0) {
      await this.db.persistData(itemsAreSaved);
    }

    this.store.clear();

    return {
      quantityRowsAreSaved: itemsAreSaved.length,
    };
  }
}

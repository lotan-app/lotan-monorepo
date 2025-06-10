import { IEvent } from './types/IEvent';
import { IHashing } from './types/IHashing';
import { IStore } from './types/IStore';
import { ITokenManager } from './types/ITokenManager';

export abstract class EventProcessor {
  constructor(
    protected readonly store: IStore,
    protected readonly tokenManager: ITokenManager,
    protected readonly hashing: IHashing,
  ) {}

  abstract processEvent(event: IEvent): Promise<void>;
}

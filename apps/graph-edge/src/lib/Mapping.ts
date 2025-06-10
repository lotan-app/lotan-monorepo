import { bundlePath, subgraphConfigPath } from './constant';
import { EventProcessor } from './EventProcessor';
import { getSubgraphConfig } from './helpers/getSubgraphConfig';
import { IEvent } from './types/IEvent';
import { IHashing } from './types/IHashing';
import { IStore } from './types/IStore';
import { ITokenManager } from './types/ITokenManager';

export class Mapping extends EventProcessor {
  private mappings: { type: string; processor: EventProcessor }[];

  constructor(
    protected readonly store: IStore,
    protected readonly tokenManager: ITokenManager,
    protected readonly hashing: IHashing,
  ) {
    super(store, tokenManager, hashing);
    this.initialize();
  }

  private async createInstance(_class): Promise<EventProcessor> {
    const instance: EventProcessor = new _class(this.store, this.tokenManager, this.hashing);
    return instance;
  }

  registerProcessor(type: string, processor: EventProcessor) {
    this.mappings.push({ type, processor });
  }

  private async initialize() {
    this.mappings = [];

    const subgraphConfig = getSubgraphConfig(subgraphConfigPath);

    const { default: bundle } = await import(bundlePath);
    for (const mappingConfig of subgraphConfig.mappings) {
      const processor = await this.createInstance(bundle[mappingConfig.mapping]);

      this.registerProcessor(mappingConfig.type, processor);
    }
  }

  private matchEventProcessor(type: string): EventProcessor {
    const mapping = this.mappings.find(mapping => type.startsWith(mapping.type));

    if (!mapping) {
      throw new Error(`Not found event mapping ${type}`);
    }

    return mapping.processor;
  }

  async processEvent(event: IEvent): Promise<void> {
    if (!this.mappings) {
      await this.initialize();
    }

    const processor = this.matchEventProcessor(event.type);

    await processor.processEvent(event);
  }
}

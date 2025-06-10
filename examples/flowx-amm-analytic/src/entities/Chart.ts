import { Chart as ChartType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { IStore } from '../lib/types/IStore';
import { IHashing } from 'lib/types/IHashing';

export class Chart {
  private entity = 'chart'; //from prisma
  private data: ChartType; //from prisma

  constructor(
    private readonly identifyCompose: { interval: string; time: bigint; pair: string },
    protected readonly store: IStore,
    protected readonly hashing: IHashing,
  ) {}

  private getId(): string {
    const { interval, time, pair } = this.identifyCompose;

    return this.hashing.hashString(`${interval}_${time}_${pair}`);
  }

  private initData(): ChartType {
    const { interval, time, pair } = this.identifyCompose;

    return {
      id: this.getId(),
      time,
      close: new Decimal(0),
      high: new Decimal(0),
      interval,
      low: new Decimal(0),
      pair,
    };
  }

  async loadData() {
    if (this.data) {
      return this.data;
    }

    let data = await this.store.loadData<ChartType>(this.entity, this.getId());

    if (!data) {
      data = this.initData();
    }

    this.data = data;

    return this.data;
  }

  save() {
    this.store.save(this.entity, this.data);
  }

  get id(): string {
    return this.data.id;
  }

  get interval(): string {
    return this.data.interval;
  }

  get time(): bigint {
    return this.data.time;
  }

  get pair(): string {
    return this.data.pair;
  }

  get close(): Decimal {
    return this.data.close;
  }

  set close(value: Decimal) {
    this.data.close = value;
  }

  get high(): Decimal {
    return this.data.high;
  }

  set high(value: Decimal) {
    this.data.high = value;
  }

  get low(): Decimal {
    return this.data.low;
  }

  set low(value: Decimal) {
    this.data.low = value;
  }
}

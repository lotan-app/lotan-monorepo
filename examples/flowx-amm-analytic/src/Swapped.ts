import { normalizeStructTag } from '@mysten/sui/utils';
import { Decimal } from '@prisma/client/runtime/library';
import { IEvent } from './lib/types/IEvent';
import { IStore } from './lib/types/IStore';
import { ITokenManager } from './lib/types/ITokenManager';

import { Chart } from './entities/Chart';
import { EventProcessor } from './lib/EventProcessor';
import { IHashing } from 'lib/types/IHashing';

const REGEX_MOVE_OBJECT_ID = /0x[0-9a-fA-F]{1,64}/g;
const OBJECT_ID_LENGTH = 64;

export interface SwappedEventData {
  user: string;
  coin_x: string;
  coin_y: string;
  amount_x_in: string;
  amount_y_in: string;
  amount_x_out: string;
  amount_y_out: string;
}

export default class Swapped extends EventProcessor {
  constructor(
    protected readonly store: IStore,
    protected readonly tokenManager: ITokenManager,
    protected readonly hashing: IHashing,
  ) {
    super(store, tokenManager, hashing);
  }

  async processEvent(event: IEvent<SwappedEventData>): Promise<void> {
    const periods = Object.values(periodsMap);

    for (const period of periods) {
      const coinTypeX = normalizeStructTag(event.parsedJson.coin_x);
      const coinTypeY = normalizeStructTag(event.parsedJson.coin_y);

      const interval = period.label;
      const time = this.calculateElapsedSinceUnixEpoch(event.timestamp, period.periods);
      const lpType = this.getLPCoinType(event.packageId, coinTypeX, coinTypeY);

      const chart = new Chart({ interval, time: BigInt(time), pair: lpType }, this.store, this.hashing);
      await chart.loadData();

      const amountXAdjusted = new Decimal(event.parsedJson.amount_x_in).minus(
        new Decimal(event.parsedJson.amount_x_out),
      );
      const amountYAdjusted = new Decimal(event.parsedJson.amount_y_in).minus(
        new Decimal(event.parsedJson.amount_y_out),
      );

      const [coinX, coinY] = await Promise.all([
        this.tokenManager.getToken(coinTypeX),
        this.tokenManager.getToken(coinTypeY),
      ]);

      let price = amountYAdjusted.div(amountXAdjusted).abs();

      price = price.mul(10 ** coinX.decimals).div(10 ** coinY.decimals);

      chart.close = price;
      chart.high = price.gt(chart.high) ? price : chart.high;

      if (chart.low.eq(0)) {
        chart.low = price;
      } else {
        chart.low = price.lt(chart.low) ? price : chart.low;
      }

      chart.save();
    }
  }

  getLPCoinType(packageId: string, coinX = '', coinY = '') {
    const originalCoinX = coinX.replace(REGEX_MOVE_OBJECT_ID, (match: string) => {
      return `0x${match.slice(2).padStart(OBJECT_ID_LENGTH, '0')}`;
    });
    const originalCoinY = coinY.replace(REGEX_MOVE_OBJECT_ID, (match: string) => {
      return `0x${match.slice(2).padStart(OBJECT_ID_LENGTH, '0')}`;
    });
    if (originalCoinX < originalCoinY) {
      return `${packageId}::pair::LP<${coinX}, ${coinY}>`;
    } else {
      return `${packageId}::pair::LP<${coinY}, ${coinX}>`;
    }
  }

  calculateElapsedSinceUnixEpoch(timestamp: number, periods: number) {
    return Math.floor(timestamp / (1000 * periods));
  }
}

const periodsMap = {
  15: {
    label: '15s',
    periods: 15,
  },
  30: {
    label: '30s',
    periods: 30,
  },
  60: {
    label: '1m',
    periods: 60,
  },
  300: {
    label: '5m',
    periods: 300,
  },
  3600: {
    label: '1h',
    periods: 3600,
  },
  7200: {
    label: '2h',
    periods: 7200,
  },
  14400: {
    label: '4h',
    periods: 14400,
  },
  86400: {
    label: '1d',
    periods: 86400,
  },
  604800: {
    label: '7d',
    periods: 604800,
  },
  2592000: {
    label: '30d',
    periods: 2592000,
  },
};

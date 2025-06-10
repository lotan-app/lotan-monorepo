import { normalizeStructTag } from '@mysten/sui/utils';
import { customNormalizeStructTag } from './helpers/customNormalizeStructTag';
import { IEvent } from './types/IEvent';
import { ICheckpoint } from './types/ICheckpoint';
import { ITransaction } from './types/ITransaction';
import { SuiCheckpointReader } from '@lotan/sui-checkpoint-reader';
import { delay } from './utils/delay';

export class CheckpointFetcher {
  constructor(private readonly suiCheckpointReader: SuiCheckpointReader, private whitelistEventTypes: string[]) {
    this.whitelistEventTypes = this.whitelistEventTypes.map(whitelistEventType =>
      normalizeStructTag(whitelistEventType),
    );
  }

  private isValidType(type: string): boolean {
    return this.whitelistEventTypes.includes(type);
  }

  async fetchCheckpoint(checkpointNumber: number): Promise<ICheckpoint> {
    try {
      const rawCheckpointData = await this.suiCheckpointReader.fetchCheckpoint(BigInt(checkpointNumber));

      const data = JSON.parse(rawCheckpointData.data) as {
        checkpoint_summary: {
          data: {
            sequence_number: number;
            timestamp_ms: number;
          };
        };
        transactions: {
          transaction_digest: string;
          events: {
            data: {
              package_id: string;
              transaction_module: string;
              sender: string;
              type_: any;
              contents: number[];
            }[];
          } | null;
        }[];
      };

      const timestamp = data.checkpoint_summary.data.timestamp_ms;

      const transactions: ITransaction[] = await Promise.all(
        data.transactions.map(async (transaction, txIndex) => {
          const txDigest = transaction.transaction_digest;
          const rawEvents = transaction?.events?.data || [];

          const events: (IEvent | null)[] = await Promise.all(
            rawEvents.map(async (event, eventSeq) => {
              const { package_id, sender, transaction_module, type_, contents } = event;
              const type = customNormalizeStructTag(type_);

              if (!this.isValidType(type)) {
                return null;
              }

              const stringContents = await this.suiCheckpointReader.parseEventContents(JSON.stringify(type_), contents);

              if (stringContents.error) {
                throw new Error(
                  `Parse event contents error: ${JSON.stringify({
                    eventSeq,
                    txDigest,
                  })}`,
                );
              }

              return {
                eventSeq,
                txDigest,
                checkpoint: checkpointNumber,
                parsedJson: JSON.parse(stringContents.data as string),
                sender,
                timestamp,
                packageId: package_id,
                transactionModule: transaction_module,
                txIndex,
                type,
              };
            }),
          );

          const newEvents: IEvent[] = events.filter(event => !!event);

          return {
            txDigest,
            txIndex,
            events: newEvents,
          };
        }),
      );

      const newTransactions = transactions.filter(transaction => transaction.events.length > 0);

      return {
        checkpoint: checkpointNumber,
        transactions: newTransactions,
      };
    } catch (error) {
      console.error('Fetch checkpoint error:', error);
      await delay(1000);
      return await this.fetchCheckpoint(checkpointNumber);
    }
  }
}

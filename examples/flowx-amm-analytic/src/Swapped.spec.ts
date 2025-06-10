import { IHashing } from 'lib/types/IHashing';
import Swapped, { SwappedEventData } from './Swapped';
import { IEvent } from './lib/types/IEvent';
import { IStore } from './lib/types/IStore';
import { ITokenManager } from './lib/types/ITokenManager';

describe('Swapped.processEvent - Mock Dependencies', () => {
  let swapped: Swapped;
  let mockStore: jest.Mocked<IStore>;
  let mockTokenManager: jest.Mocked<ITokenManager>;
  let mockHashing: jest.Mocked<IHashing>;

  beforeEach(() => {
    // Mock store
    mockStore = {
      loadData: jest.fn().mockImplementation(() => {
        return null;
      }),
      save: jest.fn().mockImplementation((entity, data) => {
        return null;
      }),
      delete: jest.fn(),
    } as jest.Mocked<IStore>;

    // Mock token manager
    mockTokenManager = {
      getToken: jest.fn().mockImplementation(type => {
        if (type === '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN') {
          return Promise.resolve({ decimals: 6 });
        }
        if (type === '0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f::coin::COIN') {
          return Promise.resolve({ decimals: 8 });
        }
      }),
    } as jest.Mocked<ITokenManager>;

    mockHashing = {
      hashString: jest.fn().mockImplementation(input => {
        return input;
      }),
    } as jest.Mocked<IHashing>;

    // Instantiate Swapped with mocked dependencies
    swapped = new Swapped(mockStore, mockTokenManager, mockHashing);
  });

  it('should call loadData and save on Chart', async () => {
    const mockEvent: IEvent<SwappedEventData> = {
      txDigest: 'mockTxDigest',
      packageId: 'mockPackageId',
      checkpoint: 1,
      eventSeq: 1,
      sender: 'sender',
      transactionModule: 'transactionModule',
      txIndex: 1,
      type: 'Swapped',
      parsedJson: {
        coin_x: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN',
        coin_y: '0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f::coin::COIN',
        amount_x_in: '1000000',
        amount_y_in: '2000000',
        amount_x_out: '500000',
        amount_y_out: '1000000',
        user: 'user',
      },
      timestamp: Date.now(),
    };

    await swapped.processEvent(mockEvent);

    // Assertions
    expect(mockTokenManager.getToken).toHaveBeenCalledWith(
      '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN',
    );
    expect(mockTokenManager.getToken).toHaveBeenCalledWith(
      '0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f::coin::COIN',
    );
    expect(mockStore.save).toHaveBeenCalled();
  });
});

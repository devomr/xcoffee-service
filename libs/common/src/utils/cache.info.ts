import { Address } from '@multiversx/sdk-core/out';
import { Constants } from '@multiversx/sdk-nestjs-common';

export class CacheInfo {
  key: string = '';
  ttl: number = Constants.oneSecond() * 6;

  static LastProcessedNonce(shardId: number): CacheInfo {
    return {
      key: `lastProcessedNonce:${shardId}`,
      ttl: Constants.oneMonth(),
    };
  }

  static Examples: CacheInfo = {
    key: 'examples',
    ttl: Constants.oneHour(),
  };

  static SubscriptionDeadline(address: Address): CacheInfo {
    return {
      key: `subscription:${address.toString()}`,
      ttl: Constants.oneMinute() * 10,
    };
  }

  static CreatorSupporters: CacheInfo = {
    key: 'creator:supporters',
    ttl: Constants.oneSecond() * 5,
  };

  static DonationsHistory: CacheInfo = {
    key: 'donations:history',
    ttl: Constants.oneSecond() * 5,
  };
}

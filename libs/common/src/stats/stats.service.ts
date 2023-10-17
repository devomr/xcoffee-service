import { Injectable } from '@nestjs/common';
import { DonationTransaction } from './entities';
import { ApiService } from '@multiversx/sdk-nestjs-http';
import { ApiConfigService } from '../config';
import { CacheService } from '@multiversx/sdk-nestjs-cache';
import { CacheInfo, ConvertUtil } from '../utils';

@Injectable()
export class StatsService {
  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly apiService: ApiService,
    private readonly cacheService: CacheService,
  ) {}

  async getCountOfSupporters(address: string): Promise<number> {
    return await this.cacheService.getOrSet(
      `${CacheInfo.CreatorSupporters.key}:${address}`,
      async () => {
        const history = await this.getDonationsHistory(address);
        return history.length;
      },
      CacheInfo.CreatorSupporters.ttl,
    );
  }

  async getDonationsHistory(address: string): Promise<DonationTransaction[]> {
    return await this.cacheService.getOrSet(
      `${CacheInfo.DonationsHistory.key}:${address}`,
      async () => await this.getDonationsRaw(address),
      CacheInfo.DonationsHistory.ttl,
    );
  }

  async getDonationsRaw(address: string): Promise<DonationTransaction[]> {
    const apiUrl = this.apiConfigService.getApiUrl();
    const contract = this.apiConfigService.getXcoffeeContract();

    const response = await this.apiService.get(
      `${apiUrl}/accounts/${contract}/transfers`,
    );

    const donationTransactions = [];
    const rawTransactions: any[] = response.data || [];

    const smartContractResults = rawTransactions.filter(
      (t) => t.type === 'SmartContractResult',
    );
    const transactions = rawTransactions.filter(
      (t) => t.type === 'Transaction',
    );

    const creatorTransferTransactions = smartContractResults.filter(
      (t) => t.receiver === address,
    );
    const donateTransactions = [];

    for (const transferTransaction of creatorTransferTransactions) {
      const found = transactions.find(
        (t) => t.txHash === transferTransaction.originalTxHash,
      );
      if (found) {
        donateTransactions.push(found);
      }
    }

    for (const transaction of donateTransactions) {
      const transactionArgs = ConvertUtil.base64ToString(transaction.data);
      const args = transactionArgs.split('@');

      console.log(transactionArgs);
      // const senderAddress = transaction.sender;
      // const creatorAddress = transactionArgs[0];
      const txHash = transaction.hash;
      const amount = transaction.value;
      const name = 2 < args.length ? ConvertUtil.hexToString(args[2]) : '';
      const message = 3 < args.length ? ConvertUtil.hexToString(args[3]) : '';

      const donationTransaction: DonationTransaction = {
        name: name,
        message: message,
        txHash: txHash,
        amount: amount,
      };
      donationTransactions.push(donationTransaction);
    }

    return donationTransactions;
  }
}

import { CacheService } from '@multiversx/sdk-nestjs-cache';
import { Locker } from '@multiversx/sdk-nestjs-common';
import { TransactionProcessor } from '@multiversx/sdk-transaction-processor';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiConfigService, CacheInfo } from '@mvx-monorepo/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TransactionProcessorService {
  private transactionProcessor: TransactionProcessor =
    new TransactionProcessor();
  private readonly logger: Logger;

  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly cacheService: CacheService,
    @Inject('PUBSUB_SERVICE') private clientProxy: ClientProxy,
  ) {
    this.logger = new Logger(TransactionProcessorService.name);
  }

  @Cron('*/1 * * * * *')
  async handleNewTransactions() {
    await Locker.lock('newTransactions', async () => {
      await this.transactionProcessor.start({
        gatewayUrl: this.apiConfigService.getApiUrl(),
        maxLookBehind:
          this.apiConfigService.getTransactionProcessorMaxLookBehind(),
        // eslint-disable-next-line require-await
        onTransactionsReceived: async (
          shardId,
          nonce,
          transactions,
          statistics,
        ) => {
          // this.logger.log(
          //   `Received ${transactions.length} transactions on shard ${shardId} and nonce ${nonce}. Time left: ${statistics.secondsLeft}`,
          // );

          for (const transaction of transactions) {
            if (
              transaction.receiver ===
              this.apiConfigService.getXcoffeeContract()
            ) {
              const functionName = transaction.getDataFunctionName();
              this.logger.log(
                `Received ${transactions.length} transactions on shard ${shardId} and nonce ${nonce}. Time left: ${statistics.secondsLeft}`,
              );

              if (functionName && 'donate' === functionName) {
                const transactionArgs = transaction.getDataArgs();
                const senderAddress = transaction.sender;
                const creatorAddress = transactionArgs[0];
                const txHash = transaction.hash;
                const amount = transaction.value;
                const name = transactionArgs[1];
                const message = transactionArgs[2];

                this.logger.log('### Donate transaction found!!!');
                this.logger.log('Sender: ' + senderAddress);
                this.logger.log('Creator: ' + creatorAddress);
                this.logger.log('Hash: ' + txHash);
                this.logger.log('Amount: ' + amount);
                this.logger.log('Name: ' + name);
                this.logger.log('Message: ' + message);
              }

              if (functionName && 'subscribe' === functionName) {
                this.logger.log('Subscribe transaction detected');
                await this.deleteCacheKey(`subscribe:${transaction.sender}`);
              }
            }
          }
        },
        getLastProcessedNonce: async (shardId) => {
          return await this.cacheService.getRemote(
            CacheInfo.LastProcessedNonce(shardId).key,
          );
        },
        setLastProcessedNonce: async (shardId, nonce) => {
          await this.cacheService.setRemote(
            CacheInfo.LastProcessedNonce(shardId).key,
            nonce,
            CacheInfo.LastProcessedNonce(shardId).ttl,
          );
        },
      });
    });
  }

  private deleteCacheKey(key: string) {
    this.clientProxy.emit('deleteCacheKeys', [key]);
  }
}

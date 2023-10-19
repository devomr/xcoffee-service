import {
  AbiRegistry,
  Address,
  ResultsParser,
  SmartContract,
  TokenTransfer,
} from '@multiversx/sdk-core/out';
import { Injectable } from '@nestjs/common';
import xCoffeeAbi from './xcoffee.abi.json';
import { ApiConfigService, CacheInfo } from '@mvx-monorepo/common';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers/out';
import { CacheService } from '@multiversx/sdk-nestjs-cache';

@Injectable()
export class XcoffeeService {
  private readonly smartContract: SmartContract;
  private readonly networkProvider: ApiNetworkProvider;

  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.networkProvider = new ApiNetworkProvider(
      this.apiConfigService.getApiUrl(),
    );
    this.smartContract = this.initSmartContract();
  }

  async generateDonateTransaction(
    address: Address,
    creator: Address,
    name: string,
    message: string,
    amount: number,
  ): Promise<any> {
    const account = await this.networkProvider.getAccount(address);

    const donateTransaction = this.smartContract.methods
      .donate([creator, name, message])
      .withSender(address)
      .withValue(TokenTransfer.egldFromAmount(amount))
      .withGasLimit(60_000_000)
      .withChainID(this.apiConfigService.getChainId())
      .withNonce(account.nonce)
      .buildTransaction();

    return donateTransaction.toPlainObject();
  }

  async getSubscriptionDuration(
    userAddress: Address,
    creatorAddress: Address,
  ): Promise<{
    status: string;
    subscriptionId?: number;
    remainingTime?: number;
  }> {
    const subscriptionDeadlineTimestamp = await this.getSubscriptionDeadlineRaw(
      userAddress,
      creatorAddress,
    );

    if (!subscriptionDeadlineTimestamp) {
      return { status: 'not_yet_subscribed' };
    }

    const subscriptionDeadline = new Date(
      subscriptionDeadlineTimestamp.deadline,
    );

    let secondsRemaining =
      (subscriptionDeadline.getTime() - new Date().getTime()) / 1000;
    if (secondsRemaining < 0) {
      secondsRemaining = 0;
    }

    return {
      status: 'active_subscription',
      subscriptionId: subscriptionDeadlineTimestamp.subscriptionId,
      remainingTime: secondsRemaining,
    };
  }

  async getSubscriptionDeadline(
    userAddress: Address,
    creatorAddress: Address,
  ): Promise<{ subscriptionId: number; deadline: number } | null> {
    return await this.cacheService.getOrSet(
      CacheInfo.SubscriptionDeadline(userAddress).key,
      async () =>
        await this.getSubscriptionDeadlineRaw(userAddress, creatorAddress),
      CacheInfo.SubscriptionDeadline(userAddress).ttl,
    );
  }

  async getSubscriptionDeadlineRaw(
    userAddress: Address,
    creatorAddress: Address,
  ): Promise<{ subscriptionId: number; deadline: number } | null> {
    const subscriptionDeadline = await this.querySubscriptionDeadline(
      userAddress,
      creatorAddress,
    );

    if (subscriptionDeadline === undefined) {
      return null;
    }

    const date = new Date();
    date.setSeconds(date.getSeconds() + subscriptionDeadline.remainingSeconds);

    return {
      subscriptionId: subscriptionDeadline.subscriptionId,
      deadline: date.getTime(),
    };
  }

  async querySubscriptionDeadline(
    userAddress: Address,
    creatorAddress: Address,
  ): Promise<{ subscriptionId: number; remainingSeconds: number } | undefined> {
    const interaction = this.smartContract.methods.getUserSubscriptionDeadline([
      userAddress,
      creatorAddress,
    ]);
    const query = interaction.check().buildQuery();

    const queryResponse = await this.networkProvider.queryContract(query);
    const result = new ResultsParser().parseQueryResponse(
      queryResponse,
      interaction.getEndpoint(),
    );

    const value = result.firstValue?.valueOf();

    const subscriptionId = value['field0'].toNumber();
    const remainingSeconds = value['field1'].toNumber();

    if (!subscriptionId || !remainingSeconds) {
      return undefined;
    }

    return {
      subscriptionId: subscriptionId,
      remainingSeconds: remainingSeconds,
    };
  }

  private initSmartContract(): SmartContract {
    const abiRegistry = AbiRegistry.create(
      JSON.parse(JSON.stringify(xCoffeeAbi)),
    );

    const contractAddress = Address.fromBech32(
      this.apiConfigService.getXcoffeeContract(),
    );

    const contract = new SmartContract({
      address: contractAddress,
      abi: abiRegistry,
    });

    return contract;
  }
}

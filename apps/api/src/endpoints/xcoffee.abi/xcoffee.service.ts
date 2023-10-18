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
  ): Promise<{ status: string; remainingTime?: number }> {
    const subscriptionDeadlineTimestamp = await this.getSubscriptionDeadlineRaw(
      userAddress,
      creatorAddress,
    );
    console.log('getSubscriptionDuration');
    console.log(subscriptionDeadlineTimestamp);
    if (!subscriptionDeadlineTimestamp) {
      return { status: 'not_yet_subscribed' };
    }

    const subscriptionDeadline = new Date(subscriptionDeadlineTimestamp);

    let secondsRemaining =
      (subscriptionDeadline.getTime() - new Date().getTime()) / 1000;
    if (secondsRemaining < 0) {
      secondsRemaining = 0;
    }

    return { status: 'active_subscription', remainingTime: secondsRemaining };
  }

  async getSubscriptionDeadline(
    userAddress: Address,
    creatorAddress: Address,
  ): Promise<number | null> {
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
  ): Promise<number | null> {
    const secondsOfSubscription = await this.querySubscriptionDeadline(
      userAddress,
      creatorAddress,
    );

    if (secondsOfSubscription === undefined) {
      return null;
    }

    const date = new Date();
    date.setSeconds(date.getSeconds() + secondsOfSubscription);

    return date.getTime();
  }

  async querySubscriptionDeadline(
    userAddress: Address,
    creatorAddress: Address,
  ): Promise<number | undefined> {
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
    if (!value) {
      return undefined;
    }

    return value.toNumber();
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

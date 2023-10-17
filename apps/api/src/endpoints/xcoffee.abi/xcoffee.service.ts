import {
  AbiRegistry,
  Address,
  SmartContract,
  TokenTransfer,
} from '@multiversx/sdk-core/out';
import { Injectable } from '@nestjs/common';
import xCoffeeAbi from './xcoffee.abi.json';
import { ApiConfigService } from '@mvx-monorepo/common';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers/out';

@Injectable()
export class XcoffeeService {
  private readonly smartContract: SmartContract;
  private readonly networkProvider: ApiNetworkProvider;

  constructor(private readonly apiConfigService: ApiConfigService) {
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

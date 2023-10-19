import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Address } from '@multiversx/sdk-core/out';
import { XcoffeeService } from './xcoffee.service';
import { NativeAuth, NativeAuthGuard } from '@multiversx/sdk-nestjs-auth';

@Controller('xcoffee')
@ApiTags('xcoffee.abi-with-cache')
@UseGuards(NativeAuthGuard)
@ApiBearerAuth()
export class XcoffeeController {
  constructor(private readonly xcoffeeService: XcoffeeService) {}

  /**
   * Get how many seconds the subscription has until expires.
   * @param userAddress Wallet address of the subscriber
   * @param creatorAddress Wallet address of the creator
   * @returns Number of seconds
   */
  @Get('/subscription-duration/:creatorAddress')
  @ApiResponse({
    status: 200,
    description: 'Returns one example',
  })
  async getSubscriptionDuration(
    @NativeAuth('address') userAddress: string,
    @Param('creatorAddress') creatorAddress: string,
  ): Promise<{
    status: string;
    remainingTime?: number;
  }> {
    return await this.xcoffeeService.getSubscriptionDuration(
      Address.fromString(userAddress),
      Address.fromString(creatorAddress),
    );
  }
}

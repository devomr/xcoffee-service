import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Address } from '@multiversx/sdk-core/out';
import { XcoffeeService } from './xcoffee.service';
// import { NativeAuth } from '@multiversx/sdk-nestjs-auth';

@Controller('xcoffee')
@ApiTags('xcoffee.abi-with-cache')
// @UseGuards(NativeAuthGuard)
// @ApiBearerAuth()
export class XcoffeeController {
  constructor(private readonly xcoffeeService: XcoffeeService) {}

  @Get('/subscription-duration/:userAddress/:creatorAddress')
  @ApiResponse({
    status: 200,
    description: 'Returns one example',
  })
  async getSubscriptionDuration(
    @Param('userAddress') userAddress: string,
    @Param('creatorAddress') creatorAddress: string,
  ): Promise<{
    status: string;
    remainingTime?: number;
  }> {
    console.log;
    return await this.xcoffeeService.getSubscriptionDuration(
      Address.fromString(userAddress),
      Address.fromString(creatorAddress),
    );
  }
}

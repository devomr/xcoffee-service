import { DonationTransaction, StatsService } from '@mvx-monorepo/common';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('stats')
@ApiTags('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * Find donation transactions for an address
   * @param address Wallet address
   * @returns List of donation transactions
   */
  @Get('/donations/:address')
  async getDonationsHistory(
    @Param('address') address: string,
  ): Promise<DonationTransaction[]> {
    return await this.statsService.getDonationsHistory(address);
  }

  /**
   * Find the number of supporters for an address
   * @param address Wallet address
   * @returns Number of supporters
   */
  @Get('/supporters/:address')
  async getCountOfSupporters(
    @Param('address') address: string,
  ): Promise<number> {
    return await this.statsService.getCountOfSupporters(address);
  }
}

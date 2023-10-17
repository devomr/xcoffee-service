import { Controller, Get, Param } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { Donation } from './schemas/donation.schema';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get('creator/:address')
  async findDonationsForCreator(
    @Param('address') address: string,
  ): Promise<Donation[]> {
    return await this.donationsService.findDonationsForCreator(address);
  }
}

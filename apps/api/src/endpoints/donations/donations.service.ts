import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Donation, DonationDocument } from './schemas/donation.schema';

@Injectable()
export class DonationsService {
  constructor(
    @InjectModel(Donation.name)
    private readonly donationModel: Model<DonationDocument>,
  ) {}

  /**
   * Find all donations for a creator
   * @param address Wallet address
   * @returns List of donations
   */
  async findDonationsForCreator(address: string): Promise<Donation[]> {
    return await this.donationModel.find({ creatorAddress: address }).exec();
  }
}

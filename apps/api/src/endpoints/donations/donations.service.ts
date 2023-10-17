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

  async create(
    name: string,
    message: string,
    amount: string,
    txHash: string,
    senderAddress: string,
    creatorAddress: string,
  ): Promise<Donation> {
    const createdDonation = await new this.donationModel({
      name: name,
      message: message,
      amount: amount,
      txHash: txHash,
      senderAddress: senderAddress,
      creatorAddress: creatorAddress,
      createdAt: new Date(),
    }).save();
    return createdDonation;
  }

  async findDonationsForCreator(address: string): Promise<Donation[]> {
    return await this.donationModel.find({ creatorAddress: address }).exec();
  }
}

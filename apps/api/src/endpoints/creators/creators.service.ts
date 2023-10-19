import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Creator, CreatorDocument } from './schemas/creator.schema';

@Injectable()
export class CreatorsService {
  constructor(
    @InjectModel(Creator.name)
    private readonly creatorModel: Model<CreatorDocument>,
  ) {}

  /**
   * Add new creator in the database
   * @param creator Added Creator data
   * @returns
   */
  async create(creator: Creator): Promise<Creator> {
    const createdCreator = await this.creatorModel.create(creator);
    return createdCreator;
  }

  /**
   * Update existing creator in the database
   * @param creator
   * @returns Updated Creator data
   */
  async update(creator: Creator): Promise<Creator> {
    const updatedCreator = await this.creatorModel.findOneAndUpdate(
      { address: creator.address },
      creator,
      { new: true },
    );
    return updatedCreator;
  }

  /**
   * Find a creator by his wallet address
   * @param address Wallet address
   * @returns Creator data
   */
  async findCreatorByAddress(address: string): Promise<Creator> {
    return await this.creatorModel.findOne({ address: address }).exec();
  }

  /**
   * Find the last registered creators
   * @returns List of creators
   */
  async findLastCreators(): Promise<Creator[]> {
    return await this.creatorModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();
  }

  /**
   * Find all available creators
   * @returns List of creators
   */
  async findAll(): Promise<Creator[]> {
    return await this.creatorModel.find().exec();
  }
}

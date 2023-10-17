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

  async create(creator: Creator): Promise<Creator> {
    const createdCreator = await this.creatorModel.create(creator);
    return createdCreator;
  }

  async findCreatorByAddress(address: string): Promise<Creator> {
    return await this.creatorModel.findOne({ address: address }).exec();
  }

  async findTopSupportedCreators(): Promise<Creator[]> {
    return await this.creatorModel
      .find()
      .sort({ supporters: -1 })
      .limit(10)
      .exec();
  }

  async findAll(): Promise<Creator[]> {
    return await this.creatorModel.find().exec();
  }
}

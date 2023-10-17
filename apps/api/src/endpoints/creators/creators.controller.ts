import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatorsService } from './creators.service';
import { Creator } from './schemas/creator.schema';

@Controller('creators')
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  @Post()
  async create(@Body() creator: Creator) {
    await this.creatorsService.create(creator);
  }

  @Get('top-supported')
  async findTopSupported(): Promise<Creator[]> {
    return await this.creatorsService.findTopSupportedCreators();
  }

  @Get('search/:address')
  async findCreatorByAddress(
    @Param('address') address: string,
  ): Promise<Creator> {
    return await this.creatorsService.findCreatorByAddress(address);
  }

  @Get()
  async findAll(): Promise<Creator[]> {
    return await this.creatorsService.findAll();
  }
}

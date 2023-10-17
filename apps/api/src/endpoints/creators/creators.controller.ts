import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseFilters,
} from '@nestjs/common';
import { CreatorsService } from './creators.service';
import { Creator } from './schemas/creator.schema';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

@UseFilters(new HttpExceptionFilter())
@Controller('creators')
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  /**
   * Add new creator in the database
   * @param creator Creator data
   * @returns New Creator
   */
  @Post()
  async create(@Body() creator: Creator) {
    let result = null;

    try {
      result = await this.creatorsService.create(creator);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('This wallet address is already in use');
      }
    }

    return result;
  }

  /**
   * Update the creator profile details
   * @param creator Creator data
   * @returns Updated Creator
   */
  @Put()
  async update(@Body() creator: Creator) {
    // find the creator by his wallet address to check if exists
    const existingCreator = await this.creatorsService.findCreatorByAddress(
      creator.address,
    );

    if (!existingCreator) {
      throw new HttpException('Creator not found', HttpStatus.NOT_FOUND);
    }

    const result = await this.creatorsService.update(creator);
    return result;
  }

  /**
   * Find the top 10 creators that have the most supporters
   * @returns List of creators
   */
  @Get('top-supported')
  async findTopSupported(): Promise<Creator[]> {
    return await this.creatorsService.findTopSupportedCreators();
  }

  /**
   * Find a creator by his wallet address
   * @param address Wallet address
   * @returns Creator
   */
  @Get('search/:address')
  async findCreatorByAddress(
    @Param('address') address: string,
  ): Promise<Creator> {
    const result = await this.creatorsService.findCreatorByAddress(address);

    if (!result) {
      throw new HttpException('Creator not found', HttpStatus.NOT_FOUND);
    }

    return result;
  }

  /**
   * Find all available creators
   * @returns List of creators
   */
  @Get()
  async findAll(): Promise<Creator[]> {
    return await this.creatorsService.findAll();
  }
}

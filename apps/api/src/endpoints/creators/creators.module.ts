import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoSQLDatabaseModule } from '@mvx-monorepo/common';
import { Creator, CreatorSchema } from './schemas/creator.schema';
import { CreatorsService } from './creators.service';

@Module({
  imports: [
    NoSQLDatabaseModule,
    MongooseModule.forFeature([{ name: Creator.name, schema: CreatorSchema }]),
  ],
  providers: [CreatorsService],
  exports: [CreatorsService],
})
export class CreatorsModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoSQLDatabaseModule } from '@mvx-monorepo/common';
import { Donation, DonationSchema } from './schemas/donation.schema';
import { DonationsService } from './donations.service';

@Module({
  imports: [
    NoSQLDatabaseModule,
    MongooseModule.forFeature([
      { name: Donation.name, schema: DonationSchema },
    ]),
  ],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule {}

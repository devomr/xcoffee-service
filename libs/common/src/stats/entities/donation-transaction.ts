import { ApiProperty } from '@nestjs/swagger';

export class DonationTransaction {
  @ApiProperty()
  name: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  txHash: string;
}

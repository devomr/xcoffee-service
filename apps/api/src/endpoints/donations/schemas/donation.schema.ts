import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DonationDocument = Donation & Document;

@Schema()
export class Donation {
  @Prop()
  name: string;

  @Prop()
  message: string;

  @Prop()
  amount: string;

  @Prop()
  txHash: string;

  @Prop()
  senderAddress: string;

  @Prop()
  creatorAddress: string;

  @Prop()
  createdAt: Date;
}

export const DonationSchema = SchemaFactory.createForClass(Donation);

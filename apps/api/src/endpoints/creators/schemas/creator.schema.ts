import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CreatorDocument = Creator & Document;

@Schema()
export class Creator {
  @Prop({ required: true, unique: true })
  address: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  supporters: number;

  @Prop({ default: () => new Date() })
  createdAt: Date;
}

export const CreatorSchema = SchemaFactory.createForClass(Creator);

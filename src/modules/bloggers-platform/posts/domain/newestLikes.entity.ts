import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  _id: false,
})
export class NewestLikes {
  @Prop({ type: String, required: true })
  userId: String;

  @Prop({ type: String, required: true })
  login: String;

  @Prop({ type: Date, required: true })
  addedAt: Date;
}

export const NewestLikesSchema = SchemaFactory.createForClass(NewestLikes);

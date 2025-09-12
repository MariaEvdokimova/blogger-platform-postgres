import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NewestLikes, NewestLikesSchema } from './newestLikes.entity';

export enum LikeStatus {
  None = 'None', 
  Like = 'Like', 
  Dislike = 'Dislike',
 };

@Schema({
  _id: false,
})
export class ExtendedLikesInfo {
  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: Number, default: 0 })
  dislikesCount: number;

  @Prop({ type: String, default: LikeStatus.None })
  myStatus: string;

  @Prop({ type: [NewestLikesSchema], default: [] })
  newestLikes: NewestLikes[];
}

export const ExtendedLikesInfoSchema = SchemaFactory.createForClass(ExtendedLikesInfo);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum LikeStatus {
  None = 'None', 
  Like = 'Like', 
  Dislike = 'Dislike',
 };

@Schema({
  _id: false,
})
export class LikesInfo {
  @Prop({ type: Number, required: false, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: false, default: 0 })
  dislikesCount: number;

  @Prop({ type: String, required: false, default: LikeStatus.None })
  myStatus: string;
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);

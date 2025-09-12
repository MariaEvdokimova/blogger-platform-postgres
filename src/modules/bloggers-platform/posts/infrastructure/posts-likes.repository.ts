import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";
import mongoose, { Types } from "mongoose";
import { LikePost, LikePostDocument, LikePostModelType } from "../domain/likes.entity";
import { LikeStatus } from "../domain/extendedLikesInfo.entity";

@Injectable()
export class PostLikesRepository {

  constructor(@InjectModel(LikePost.name) private LikePostModel: LikePostModelType) {}

  async save(comment: LikePostDocument): Promise<LikePostDocument> {
    return await comment.save();
  }

  async findUserPostStatus( postId: string, userId: string ): Promise<LikePostDocument | null> {
    this._checkObjectId( userId );
    this._checkObjectId( postId );

    return this.LikePostModel.findOne({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId)
    });
  }
  
  async findLastThreeLikes ( postId: string): Promise<LikePostDocument[]> {
    return this.LikePostModel.find({
      postId: new Types.ObjectId(postId),
      status: LikeStatus.Like
    })
    .sort({ createdAt: -1 })
    .limit(3)
  }

  private _checkObjectId(id: string) {
    const isValidId = mongoose.isValidObjectId(id);
    if ( !isValidId ) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not fouund',
      });
    }
    return isValidId;
  }
}

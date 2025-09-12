import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { LikePost, LikePostDocument, LikePostModelType } from "../../domain/likes.entity";
import { LikeStatus } from "../../domain/extendedLikesInfo.entity";
import mongoose, { Types } from "mongoose";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class PostsLikesQueryRepository {
  constructor(
    @InjectModel(LikePost.name)
    private LikePostModel: LikePostModelType,
  ) {}

  async findStatusByUserIdAndPostId( userId: string, postId: string): Promise<LikeStatus | null> {
    this._checkObjectId(userId);
    this._checkObjectId(postId);
    
    const result = await this.LikePostModel.findOne({ 
      userId: new Types.ObjectId(userId), 
      postId: new Types.ObjectId(postId) 
    });
    return result ? result.status : null
  }

  async findByPostIds(postIds: string[], userId: string): Promise<LikePostDocument[]>{
    return this.LikePostModel.find({
      postId: { $in: postIds.map(id => new Types.ObjectId(id)) },
      userId: new Types.ObjectId(userId)
    }).exec();
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

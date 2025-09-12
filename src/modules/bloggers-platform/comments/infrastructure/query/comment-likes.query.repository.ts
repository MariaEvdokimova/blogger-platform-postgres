import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { LikeComment, LikeCommentDocument, LikeCommentModelType } from "../../domain/likes.entity";
import { LikeStatus } from "../../domain/likesInfo.entity";

@Injectable()
export class CommentsLikesQueryRepository {
  constructor(
    @InjectModel(LikeComment.name)
    private LikeCommentModel: LikeCommentModelType,
  ) {}

  async findStatusByUserIdAndPostId( userId: string, commentId: string): Promise<LikeStatus | null> {
    this._checkObjectId(userId);
    this._checkObjectId(commentId);
    
    const result = await this.LikeCommentModel.findOne({ 
      userId: new Types.ObjectId(userId), 
      commentId: new Types.ObjectId(commentId) 
    });
    return result ? result.status : null
  }

  async findByCommentIds(commentIds: string[], userId: string): Promise<LikeCommentDocument[]>{
    return this.LikeCommentModel.find({
      commentId: { $in: commentIds.map(id => new Types.ObjectId(id)) },
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

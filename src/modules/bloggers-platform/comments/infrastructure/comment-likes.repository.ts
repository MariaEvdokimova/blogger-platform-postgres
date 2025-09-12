import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";
import mongoose, { Types } from "mongoose";
import { LikeComment, LikeCommentDocument, LikeCommentModelType } from "../domain/likes.entity";

@Injectable()
export class CommentLikesRepository {

  constructor(@InjectModel(LikeComment.name) private LikeCommentModel: LikeCommentModelType) {}

  async save(comment: LikeCommentDocument): Promise<LikeCommentDocument> {
    return await comment.save();
  }

  async findUserCommentStatus( commentId: string, userId: string ): Promise<LikeCommentDocument | null> {
    this._checkObjectId( userId );
    this._checkObjectId( commentId );

    return this.LikeCommentModel.findOne({
      commentId: new Types.ObjectId(commentId),
      userId: new Types.ObjectId(userId)
    });
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

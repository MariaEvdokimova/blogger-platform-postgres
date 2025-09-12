import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Comment, CommentDocument, CommentModelType } from "../domain/comment.entity";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";
import mongoose, { Types } from "mongoose";

@Injectable()
export class CommentsRepository {

  constructor(@InjectModel(Comment.name) private CommentModel: CommentModelType) {}

  async findById(id: string): Promise<CommentDocument | null> {
    return this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(comment: CommentDocument): Promise<CommentDocument> {
    return await comment.save();
  }

  async findOrNotFoundFail(id: string): Promise<CommentDocument> {
    const comment = await this.findById(id);

    if (!comment) {
      //TODO: replace with domain exception
      throw new NotFoundException('post not found');
    }

    return comment;
  }

  async verifyUserOwnership ( commentId: string, userId: string): Promise<CommentDocument | null>  {
    this._checkObjectId( userId );
    this._checkObjectId( commentId );

    return this.CommentModel.findOne({
      _id: new Types.ObjectId(commentId),
      'commentatorInfo.userId': new Types.ObjectId(userId)
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

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { СommentatorInfo, СommentatorInfoSchema } from "./commentatorInfo.entity";
import { LikesInfo, LikesInfoSchema, LikeStatus } from "./likesInfo.entity";
import { CreateCommentDomainDto } from "./dto/create-comment.domain.dto";

export const contentConstraints = {
  minLength: 20,
  maxLength: 300,
};
//флаг timestemp автоматичеки добавляет поля upatedAt и createdAt
/**
 * Comment Entity Schema
 * This class represents the schema and behavior of a Comment entity.
 */
@Schema({ timestamps: true })
export class Comment {
  /**
   * Name of the blog
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  content: string;
 
  /**
   * description
   * @type {Types.ObjectId}
   * @required
   */
  @Prop({ type: Types.ObjectId, required: true })
  postId: Types.ObjectId;
 
  // @Prop(СommentatorInfoSchema) this variant from docdoesn't make validation for inner object
  @Prop({ type: СommentatorInfoSchema })
  commentatorInfo: СommentatorInfo;

  // @Prop(LikesInfoSchema) this variant from docdoesn't make validation for inner object
  @Prop({ type: LikesInfoSchema })
  likesInfo: LikesInfo;
  
  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;
 
  /**
   * Virtual property to get the stringified ObjectId
   * @returns {string} The string representation of the ID
   */
  get id() {
    // @ts-ignore
    return this._id.toString();
  }

  /**
   * Deletion timestamp, nullable, if date exist, means entity soft deleted
   * @type {Date | null}
   */
  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;
 
  static createInstance(dto: CreateCommentDomainDto): CommentDocument {
    const comment = new this();
    comment.content = dto.content;
    comment.commentatorInfo = {
      userLogin: dto.userLogin,
      userId: dto.userId,
    };
    comment.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None
    }
    comment.postId = new Types.ObjectId(dto.postId)
    return comment as CommentDocument;
  }

  /**
   * Marks the comment as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
   * DDD continue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  updateContent( content: string ) {
    this.content = content;
  }

  updateLikesInfo ( likeStatus: LikeStatus, userCommentStatus: LikeStatus | undefined): void {
    switch (likeStatus) {
      case LikeStatus.None:
        this.likesInfo.likesCount > 0 && this.likesInfo.likesCount--;
        this.likesInfo.dislikesCount > 0 && this.likesInfo.dislikesCount--;
        break;

      case LikeStatus.Like:
        if (userCommentStatus === LikeStatus.Dislike && this.likesInfo.dislikesCount > 0) {
          this.likesInfo.dislikesCount--;
        }
        this.likesInfo.likesCount++;
        break;

      case LikeStatus.Dislike:
        if (userCommentStatus === LikeStatus.Like && this.likesInfo.likesCount > 0) {
          this.likesInfo.likesCount--;
        }
        this.likesInfo.dislikesCount++;
        break;
    }
  }
  
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
 
//регистрирует методы сущности в схеме
CommentSchema.loadClass(Comment);
 
//Типизация документа
export type CommentDocument = HydratedDocument<Comment>;
 
//Типизация модели + статические методы
export type CommentModelType = Model<CommentDocument> & typeof Comment;
 
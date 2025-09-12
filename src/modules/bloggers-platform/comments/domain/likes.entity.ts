import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { LikeStatus } from "./likesInfo.entity";
import { CreateCommentLikeStatusDomainDto } from "./dto/create-comment-like-status.domain.dto";

//флаг timestemp автоматичеки добавляет поля upatedAt и createdAt
/**
 * Like Entity Schema
 * This class represents the schema and behavior of a Like entity.
 */
@Schema({ timestamps: true })
export class LikeComment {
  /**
   * Name of the blog
   * @type {Types.ObjectId}
   * @required
   */
  @Prop({ type: Types.ObjectId, required: true })
  commentId: Types.ObjectId;
 
  /**
   * description
   * @type {Types.ObjectId}
   * @required
   */
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  /**
   * description
   * @type {Types.LikeStatus}
   * @required
   */
  @Prop({ 
    type: String, 
    enum: LikeStatus
 })
  status: LikeStatus;
  
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
  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;
 
  static createInstance(dto: CreateCommentLikeStatusDomainDto): LikeCommentDocument {
    const like = new this();
    like.commentId = new Types.ObjectId(dto.commentId);
    like.userId = new Types.ObjectId(dto.userId);
    like.status = dto.status;

    return like as LikeCommentDocument;
  }

  /**
   * update Like Status
   */
  updateLikeStatus ( status: LikeStatus): void {
    this.status = status;
  }
}
export const LikeCommentSchema = SchemaFactory.createForClass(LikeComment);
 
//регистрирует методы сущности в схеме
LikeCommentSchema.loadClass(LikeComment);
 
//Типизация документа
export type LikeCommentDocument = HydratedDocument<LikeComment>;
 
//Типизация модели + статические методы
export type LikeCommentModelType = Model<LikeCommentDocument> & typeof LikeComment;
 
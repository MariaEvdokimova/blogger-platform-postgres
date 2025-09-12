import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { LikeStatus } from "./extendedLikesInfo.entity";
import { CreatePostLikeStatusDomainDto } from "./dto/create-post-like-status.domain.dto";

//флаг timestemp автоматичеки добавляет поля upatedAt и createdAt
/**
 * Like Entity Schema
 * This class represents the schema and behavior of a Like entity.
 */
@Schema({ timestamps: true })
export class LikePost {
  /**
   * Name of the blog
   * @type {Types.ObjectId}
   * @required
   */
  @Prop({ type: Types.ObjectId, required: true })
  postId: Types.ObjectId;
 
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
    enum: LikeStatus,
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
 
  static createInstance(dto: CreatePostLikeStatusDomainDto): LikePostDocument {
    const like = new this();
    like.postId = new Types.ObjectId(dto.postId);
    like.userId = new Types.ObjectId(dto.userId);
    like.status = dto.status;

    return like as LikePostDocument;
  }

  /**
   * update Like Status
   */
  updateLikeStatus ( status: LikeStatus): void {
    this.status = status;
  }
}
export const LikePostSchema = SchemaFactory.createForClass(LikePost);
 
//регистрирует методы сущности в схеме
LikePostSchema.loadClass(LikePost);
 
//Типизация документа
export type LikePostDocument = HydratedDocument<LikePost>;
 
//Типизация модели + статические методы
export type LikePostModelType = Model<LikePostDocument> & typeof LikePost;
 
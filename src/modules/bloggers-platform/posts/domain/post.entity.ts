import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { ExtendedLikesInfo, ExtendedLikesInfoSchema, LikeStatus } from "./extendedLikesInfo.entity";
import { CreatePostDomainDto } from "./dto/create-post.domain.dto";
import { UpdatePostDomainDto } from "../dto/update-post.dto";
import { NewestLikes } from "./newestLikes.entity";

export const titleConstraints = {
  minLength: 1,
  maxLength: 30,
};

export const shortDescriptionConstraints = {
  minLength: 1,
  maxLength: 100,
};

export const contentConstraints = {
  minLength: 1,
  maxLength: 1000,
};

//флаг timestemp автоматичеки добавляет поля upatedAt и createdAt
/**
 * Post Entity Schema
 * This class represents the schema and behavior of a Post entity.
 */
@Schema({ timestamps: true })
export class Post {
  /**
   * Title of the post
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  title: string;
  
  /**
   * shortDescription of the post
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  shortDescription: string;

  /**
   * content of the post
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  content: string;

  /**
   * blogId
   * @type {Types.ObjectId}
   * @required
   */
  @Prop({ type: Types.ObjectId, required: true })
  blogId: Types.ObjectId;
 
  /**
   * blogName of the post
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  blogName: string;

  // @Prop(extendedLikesInfoSchema) this variant from docdoesn't make validation for inner object
  @Prop({ type: ExtendedLikesInfoSchema })
  extendedLikesInfo: ExtendedLikesInfo;
  
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
 
  static createInstance(dto: CreatePostDomainDto): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName; 
    post.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: []
    }

    return post as PostDocument;
  }
 
  /**
     * Updates the post instance with new data
     * @param {UpdatePostDomainDto} dto - The data transfer object for post updates
     */
     update( dto: UpdatePostDomainDto) {
      this.title = dto.title;
      this.shortDescription = dto.shortDescription;
      this.content = dto.content;
      this.blogId = dto.blogId;
    }

  /**
   * Marks the blog as deleted
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

  updateLikesInfo ( 
    likeStatus: LikeStatus, 
    userPostStatus: LikeStatus | undefined,
  ): void {

    switch (likeStatus) {
      case LikeStatus.None:
        this.extendedLikesInfo.likesCount > 0 && this.extendedLikesInfo.likesCount--;
        this.extendedLikesInfo.dislikesCount > 0 && this.extendedLikesInfo.dislikesCount--;
        break;

      case LikeStatus.Like:
        if (userPostStatus === LikeStatus.Dislike && this.extendedLikesInfo.dislikesCount > 0) {
          this.extendedLikesInfo.dislikesCount--;
        }
        this.extendedLikesInfo.likesCount++;

        break;

      case LikeStatus.Dislike:
        if (userPostStatus === LikeStatus.Like && this.extendedLikesInfo.likesCount > 0) {
          this.extendedLikesInfo.likesCount--;
        }
        this.extendedLikesInfo.dislikesCount++;
        break;
    }
  }

  updateNewestLikes( newestLikes: NewestLikes[]): void {
    this.extendedLikesInfo.newestLikes = newestLikes;
  }


}
export const PostSchema = SchemaFactory.createForClass(Post);
 
//регистрирует методы сущности в схеме
PostSchema.loadClass(Post);
 
//Типизация документа
export type PostDocument = HydratedDocument<Post>;
 
//Типизация модели + статические методы
export type PostModelType = Model<PostDocument> & typeof Post;
 
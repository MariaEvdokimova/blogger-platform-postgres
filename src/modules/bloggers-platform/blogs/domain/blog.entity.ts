import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { CreateBlogDomainDto } from "./dto/create-blog.domain.dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";

export const nameConstraints = {
  minLength: 1,
  maxLength: 15,
};

export const descriptionConstraints = {
  minLength: 1,
  maxLength: 500,
};

export const websiteUrlConstraints = {
  minLength: 1,
  maxLength: 100,
  match: /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
};


//флаг timestemp автоматичеки добавляет поля upatedAt и createdAt
/**
 * Blog Entity Schema
 * This class represents the schema and behavior of a Blog entity.
 */
@Schema({ timestamps: true })
export class Blog {
  /**
   * Name of the blog
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  name: string;
 
  /**
   * description
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  description: string;
 
  /**
   * websiteUrl 
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  websiteUrl: string;
 
  /**
   * isMembership
   * @type {boolean}
   * @default false
   */
  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;
 
  /**
   * Deletion timestamp, nullable, if date exist, means entity soft deleted
   * @type {Date | null}
   */
  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;
 
  /**
   * Virtual property to get the stringified ObjectId
   * @returns {string} The string representation of the ID
   */
  get id() {
    // @ts-ignore
    return this._id.toString();
  }

  static createInstance(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false; 

    return blog as BlogDocument;
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
 
  /**
   * Updates the blog instance with new data
   * @param {UpdateBlogDto} dto - The data transfer object for blog updates
   * DDD continue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
   update( dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
    
}
export const BlogSchema = SchemaFactory.createForClass(Blog);
 
//регистрирует методы сущности в схеме
BlogSchema.loadClass(Blog);
 
//Типизация документа
export type BlogDocument = HydratedDocument<Blog>;
 
//Типизация модели + статические методы
export type BlogModelType = Model<BlogDocument> & typeof Blog;
 
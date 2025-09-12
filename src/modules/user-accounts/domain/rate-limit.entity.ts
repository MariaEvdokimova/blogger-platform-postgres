import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { CreateRateLimitDto } from "./dto/create-rate-limit.domain-dto";

@Schema({ timestamps: true })
export class RateLimit {
  /**
   * IP
   * @type {string}
   */
  @Prop({ type: String })
  ip: string;

  /**
   * url
   * @type {string}
   */
  @Prop({ type: String, required: true })
  url: string;
 
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
  
  static createInstance(dto: CreateRateLimitDto){
    const rateLimit = new this();
      rateLimit.ip = dto.ip;
      rateLimit.url = dto.url;
    
    return rateLimit as RateLimitDocument;
  }
}
export const RateLimitSchema = SchemaFactory.createForClass(RateLimit);
 
//регистрирует методы сущности в схеме
RateLimitSchema.loadClass(RateLimit);
 
//Типизация документа
export type RateLimitDocument = HydratedDocument<RateLimit>;
 
//Типизация модели + статические методы
export type RateLimitModelType = Model<RateLimitDocument> & typeof RateLimit;
 
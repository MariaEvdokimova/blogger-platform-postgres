import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { CreateSecurityDeviceDto } from "../dto/create-security-device.domain-dto";

@Schema({ timestamps: true })
export class SecurityDevice {
  /**
   * user Id
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  userId: string;
 
  /**
   * device Name
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  deviceName: string;

  /**
   * device Id
   * @type {ObjectId}
   * @required
   */
  @Prop({ type: Types.ObjectId, required: true })
  deviceId: Types.ObjectId;
 
  /**
   * ip
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  ip: string;
 
  /**
   * issued at
   * @type {Date | null}
   * @default null
   */
  @Prop({ type: Date, nullable: true, default: null })
  iat: Date | null;

   /**
   * expiration time
   * @type {Date | null}
   * @default null
   */
  @Prop({ type: Date, nullable: true, default: null })
  exp: Date | null;

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
  
  static createInstance(dto: CreateSecurityDeviceDto): SecurityDeviceDocument {
    
    const securityDevice = new this();
    //securityDevice.userId = dto.userId;
    //securityDevice.deviceId = dto.deviceId;
    securityDevice.deviceName = dto.deviceName;
    securityDevice.ip = dto.ip;
    securityDevice.iat = dto.iat;
    securityDevice.exp = dto.exp;

    return securityDevice as SecurityDeviceDocument;
  }

  updateIatAndExp( iat: number, exp: number ): void {
    this.iat = new Date(iat * 1000);
    this.exp = new Date(exp * 1000);
  }

}
export const SecurityDeviceSchema = SchemaFactory.createForClass(SecurityDevice);
 
//регистрирует методы сущности в схеме
SecurityDeviceSchema.loadClass(SecurityDevice);
 
//Типизация документа
export type SecurityDeviceDocument = HydratedDocument<SecurityDevice>;
 
//Типизация модели + статические методы
export type SecurityDeviceModelType = Model<SecurityDeviceDocument> & typeof SecurityDevice;
 
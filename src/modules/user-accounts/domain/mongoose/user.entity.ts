import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { add } from "date-fns/add";
import { CreateUserDomainDto } from "../dto/create-user.domain.dto";

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
  match: /^[a-zA-Z0-9_-]*$/,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  minLength: 5,
  maxLength: 500,
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

//флаг timestemp автоматичеки добавляет поля upatedAt и createdAt
/**
 * User Entity Schema
 * This class represents the schema and behavior of a User entity.
 */
@Schema({ timestamps: true })
export class User {
  /**
   * Login of the user (must be uniq)
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true, ...loginConstraints })
  login: string;
 
  /**
   * Password hash for authentication
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  passwordHash: string;
 
  /**
   * Email of the user
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true, ...emailConstraints })
  email: string;
 
  /**
   * Email confirmation status (if not confirmed in 2 days account will be deleted)
   * @type {boolean}
   * @default false
   */
  @Prop({ type: Boolean, required: true, default: false })
  isEmailConfirmed: boolean;
 
  /**
   * expiration code Date
   * @type {Date | null}
   * @default null
   */
  @Prop({ type: Date, nullable: true, default: null })
  expirationDate: Date | null;

    /**
   * confirmation code
   * @type {string}
   */
  @Prop({ type: String, required: false })
    confirmationCode: string;

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
  
  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.login = dto.login;
    user.isEmailConfirmed = false; // пользователь ВСЕГДА должен после регистрации подтверждить свой Email
 
    /*user.name = {
      firstName: 'firstName xxx',
      lastName: 'lastName yyy',
    };
 */
    return user as UserDocument;
  }
 
  /**
   * Marks the user as deleted
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
   * Set user confirmation code
   * @param {string} code - The dcode
   */
  setConfirmationCode(code: string) {
    const expirationDate = add(new Date(), { hours: 1 });

    this.expirationDate = expirationDate;
    this.confirmationCode = code;
  }

  /**
   * Set Email Confirmed true
   */
  updateEmailConfirmed (): void {
    this.isEmailConfirmed = true;
  }

  /**
   * update Password Hash
   */
  updatePasswordHash( passwordHash: string ): void {
    this.passwordHash = passwordHash;
  }

  /**
   * Updates the user instance with new data
   * Resets email confirmation if email is updated
   * @param {UpdateUserDto} dto - The data transfer object for user updates
   * DDD continue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
  /* ???????????? update(dto: UpdateUserDto) {
    if (dto.email !== this.email) {
      this.isEmailConfirmed = false;
    }
    this.email = dto.email;
  }
    
 */
}
export const UserSchema = SchemaFactory.createForClass(User);
 
//регистрирует методы сущности в схеме
UserSchema.loadClass(User);
 
//Типизация документа
export type UserDocument = HydratedDocument<User>;
 
//Типизация модели + статические методы
export type UserModelType = Model<UserDocument> & typeof User;
 
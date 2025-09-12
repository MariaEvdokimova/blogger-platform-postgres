import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument, UserModelType } from "../domain/user.entity";
import { Types } from "mongoose";

@Injectable()
export class UsersRepository {

  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(user: UserDocument): Promise<UserDocument> {
    return await user.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async doesExistByLoginOrEmail(
    login: string,
    email: string
  ): Promise< UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ email }, { login }],
      deletedAt: null
    });
  }

  async findByEmail( email: string ): Promise<UserDocument | null> {
    return this.UserModel.findOne({ email, deletedAt: null });
  }

  async findUserByConfirmationCode ( code: string ): Promise<UserDocument | null> {
    return this.UserModel.findOne({ "confirmationCode": code, deletedAt: null });
  }

  async findByUserIds(userIds: Types.ObjectId[]): Promise<UserDocument[]>{
    return this.UserModel.find({
      _id: { $in: userIds }
    }).exec();
  }

}

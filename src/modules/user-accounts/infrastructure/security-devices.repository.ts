import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { SecurityDevice, SecurityDeviceDocument, SecurityDeviceModelType } from "../domain/security-device.entity";
import mongoose, { Types } from "mongoose";
import { DomainException } from "src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";


@Injectable()
export class SecurityDeviceRepository {

  constructor(@InjectModel(SecurityDevice.name) private SecurityDeviceModel: SecurityDeviceModelType) {}

  async save(device: SecurityDeviceDocument): Promise<SecurityDeviceDocument> {
    return await device.save();
  }

  async findByDeviceIdAndUserId({ deviceId, userId }: {deviceId: string, userId: string}): Promise<SecurityDeviceDocument | null> {
    this._checkObjectId( userId );
    this._checkObjectId( deviceId );
    
    return this.SecurityDeviceModel.findOne({
      deviceId: new Types.ObjectId( deviceId ),
      userId
    });
  }

  async findUserByDeviceId( deviceId: string):  Promise< SecurityDeviceDocument | null> {
    this._checkObjectId( deviceId );
    
    return this.SecurityDeviceModel.findOne({ deviceId: new Types.ObjectId(deviceId) });
  }

  async isSessionValid (
    userId: string,
    deviceId: string,
    iat: number,
    exp: number
  ): Promise<boolean> {
    const session = await this.SecurityDeviceModel.findOne({
      deviceId: new Types.ObjectId(deviceId),
      userId,
      iat: new Date(iat * 1000), // перевод из секунд в миллисекунды,
      exp: new Date(exp * 1000), // перевод из секунд в миллисекунды
    });

    if (!session || !session.exp) return false;

    const now = Date.now();

    return session.exp.getTime() > now;
  }

  async deleteById ( userId: string, deviceId: string ): Promise<number> {
    this._checkObjectId( deviceId );
        
    const deleteResult = await this.SecurityDeviceModel.deleteOne({ 
      userId, 
      deviceId: new Types.ObjectId( deviceId ) 
    });
    return deleteResult.deletedCount;
  }

  async deleteOtherSessions ( userId: string, deviceId: string ): Promise<number> {
    this._checkObjectId( deviceId );
    
    const deleteResult = await this.SecurityDeviceModel.deleteMany({ 
      userId, 
      deviceId: { 
        $ne: new Types.ObjectId( deviceId ) 
      } 
    });

    return deleteResult.deletedCount;
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

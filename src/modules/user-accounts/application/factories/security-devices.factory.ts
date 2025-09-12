import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { SecurityDevice, SecurityDeviceDocument, SecurityDeviceModelType } from "../../domain/security-device.entity";
import { CreateSecurityDeviceDto } from "../../dto/create-security-device.dto";

@Injectable()
export class SecurityDevicesFactory {
  constructor(
    @InjectModel(SecurityDevice.name)
    private SecurityDeviceModel: SecurityDeviceModelType,
  ) {}
  
  async create(dto: CreateSecurityDeviceDto): Promise<SecurityDeviceDocument> {
     return this.SecurityDeviceModel.createInstance({
      userId: dto.userId,
      deviceId: dto.deviceId,
      deviceName: dto.deviceName,
      ip: dto.ip,
      iat: dto.iat ? new Date(dto.iat * 1000) : null,
      exp: dto.exp ? new Date(dto.exp * 1000) : null
    });
  }
}

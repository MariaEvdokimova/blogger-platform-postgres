import { Injectable } from "@nestjs/common";
import { CreateSecurityDeviceDto } from "../../dto/create-security-device.dto";
import { SecurityDevice } from "../../domain/security-device.entity";

@Injectable()
export class SecurityDevicesFactory {
  constructor(
  ) {}
  
  async create(dto: CreateSecurityDeviceDto): Promise<SecurityDevice> {
     const securityDevice = SecurityDevice.createInstance({
      userId: Number(dto.userId),
      deviceName: dto.deviceName,
      deviceId: dto.deviceId,
      ip: dto.ip,
      iat: dto.iat ? new Date(dto.iat * 1000) : null,
      exp: dto.exp ? new Date(dto.exp * 1000) : null
    });
    return securityDevice;
  }
}

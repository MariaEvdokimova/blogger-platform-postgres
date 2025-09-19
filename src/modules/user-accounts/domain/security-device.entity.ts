import { CreateSecurityDeviceDto } from "./dto/create-security-device.domain-dto";

export class SecurityDevice {
  id: string; 
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(
    public userId: number,
    public deviceName: string,
    public deviceId: string,
    public ip: string,
    public iat: Date | null,
    public exp: Date | null,
  ){}

  static createInstance(dto: CreateSecurityDeviceDto): SecurityDevice {
    return new SecurityDevice(
      dto.userId,
      dto.deviceName,
      dto.deviceId,
      dto.ip,
      dto.iat,
      dto.exp
    );
  }
}
 
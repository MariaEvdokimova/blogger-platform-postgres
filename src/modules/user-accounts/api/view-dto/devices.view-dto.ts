import { SecurityDeviceDocument } from "../../domain/security-device.entity";

export class DeviceViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(device: SecurityDeviceDocument): DeviceViewDto {
    const dto = new DeviceViewDto();

    dto.ip = device.ip;
    dto.title = device.deviceName;
    dto.lastActiveDate = device.iat ? device.iat.toISOString() : '';
    dto.deviceId = device.deviceId.toString();

    return dto;
  }
}

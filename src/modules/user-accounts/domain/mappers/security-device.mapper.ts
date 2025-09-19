import { SecurityDevice } from "../security-device.entity";

export class SecurityDeviceMapper {
  static fromDb(row: any): SecurityDevice {
    const securityDevice = new SecurityDevice(
      row.userId,
      row.deviceName,
      row.deviceId,
      row.ip,
      row.iat,
      row.exp
    );

    securityDevice.id = row.id.toString();
    securityDevice.createdAt = row.createdAt;
    securityDevice.updatedAt = row.updatedAt;

    return securityDevice;
  }
}

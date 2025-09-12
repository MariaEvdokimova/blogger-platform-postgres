import { Types } from "mongoose";

export class CreateSecurityDeviceDto {
  userId: string;
  deviceId: Types.ObjectId;
  deviceName: string;
  ip: string;
  iat: Date | null;
  exp: Date | null;
}

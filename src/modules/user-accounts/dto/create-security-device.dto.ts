import { Types } from "mongoose";

export class CreateSecurityDeviceDto {
  userId: string;
  deviceId: Types.ObjectId;
  deviceName: string;
  ip: string;
  iat?: number;
  exp?: number;
}

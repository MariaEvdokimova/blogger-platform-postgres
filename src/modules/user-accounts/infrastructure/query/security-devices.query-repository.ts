import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SecurityDevice, SecurityDeviceModelType } from '../../domain/security-device.entity';
import { DeviceViewDto } from '../../api/view-dto/devices.view-dto';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
      @InjectModel(SecurityDevice.name)
      private SecurityDeviceModel: SecurityDeviceModelType,
    ) {}

  async getDevices(userId: string): Promise<DeviceViewDto[]> {
    const devices = await this.SecurityDeviceModel.find({
      userId,
      exp: { $gt: Date.now() } 
    });

    return devices.map(DeviceViewDto.mapToView);
  }
}


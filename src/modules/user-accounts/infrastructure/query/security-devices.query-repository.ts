import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DeviceViewDto } from '../../api/view-dto/devices.view-dto';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  async getDevices(userId: string): Promise<DeviceViewDto[]> {
    const now = new Date();

    const result = await this.db.query(
      `
      SELECT 
        "deviceId", 
        "deviceName", 
        ip, 
        "iat"
      FROM public."securityDevice"
      WHERE "userId" = $1 AND "exp" > $2;
      `,
      [userId, now]
    );

    return result.rows.map(DeviceViewDto.mapToView);
  }
}


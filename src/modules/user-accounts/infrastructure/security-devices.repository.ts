import { Inject, Injectable } from "@nestjs/common";
import { Pool } from 'pg';
import { SecurityDevice } from "../domain/security-device.entity";
import { SecurityDeviceMapper } from "../domain/mappers/security-device.mapper";

@Injectable()
export class SecurityDeviceRepository {

  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  async save(dto: SecurityDevice): Promise<string> {
    if ( dto.id ) {
      const result = await this.db.query(
        `
        UPDATE public."securityDevice"
        SET 
          "userId"=$1, 
          "deviceName"=$2, 
          "deviceId"=$3, 
          ip=$4, 
          iat=$5, 
          "exp"=$6, 
          "updatedAt"=CURRENT_TIMESTAMP
        WHERE id=$7
        RETURNING id; `,
        [
          Number(dto.userId),
          dto.deviceName,
          dto.deviceId,
          dto.ip,
          dto.iat,
          dto.exp,
          dto.id
        ]
      );
      return result.rows[0].id.toString();
    } 
    const result = await this.db.query(
      `
      INSERT INTO public."securityDevice" (
        "userId", 
        "deviceName", 
        "deviceId", 
        ip, 
        iat, 
        "exp", 
        "createdAt", 
        "updatedAt"
      )
        VALUES( $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id;
      `,
      [
        Number(dto.userId),
        dto.deviceName,
        dto.deviceId,
        dto.ip,
        dto.iat,
        dto.exp
      ]
    );
    return result.rows[0].id.toString();
  }

  async updateIatAndExp( iat: number, exp: number, deviceId: string ): Promise<void>{
    const iatDTFormat = new Date(iat * 1000);
    const expDTFormat = new Date(exp * 1000);

    await this.db.query(
      `
      UPDATE public."securityDevice"
      SET "iat" = $1,
        "exp" = $2,
        "updatedAt" = CURRENT_TIMESTAMP
       WHERE "deviceId" = $3
       RETURNING id;`,
      [iatDTFormat, expDTFormat, deviceId]
    );
  }

  async findByDeviceIdAndUserId({ deviceId, userId }: { deviceId: string, userId: string }): Promise<SecurityDevice | null> {
    const result = await this.db.query(
      ` 
      SELECT 
        id, "userId", "deviceName", "deviceId", ip, iat, "exp", "createdAt", "updatedAt"
      FROM 
        public."securityDevice"
      WHERE "deviceId" = $1 AND "userId" = $2
      LIMIT 1;`,
      [ deviceId, Number(userId)]
    );

    const securityDevice = result.rows[0] ?? null;
    return securityDevice ? SecurityDeviceMapper.fromDb( securityDevice ) : null;

  }

  async findUserByDeviceId( deviceId: string):  Promise< SecurityDevice | null> {
    const result = await this.db.query(
      `SELECT * FROM public."securityDevice"
      WHERE "deviceId" = $1
      LIMIT 1`,
      [deviceId]
    );

  return result.rows[0] || null;
  }

  async isSessionValid (
    userId: string,
    deviceId: string,
    iat: number,
    exp: number
  ): Promise<boolean> {
    const result = await this.db.query(
      `SELECT "exp"
      FROM public."securityDevice"
      WHERE "userId" = $1
        AND "deviceId" = $2
        AND "iat" = to_timestamp($3)
        AND "exp" = to_timestamp($4)
      LIMIT 1`,
      [userId, deviceId, iat, exp]
    );

    const session = result.rows[0];
    if (!session || !session.exp) return false;

    const now = new Date();

    return session.exp.getTime() > now.getTime();
  }

  async deleteById ( userId: string, deviceId: string ): Promise<number> {
    const result = await this.db.query(
      `
      DELETE FROM public."securityDevice"
      WHERE 
        "userId" = $1 
        AND "deviceId" = $2;
      `,
      [ userId, deviceId ]
    );

    return result.rowCount;
  }

  async deleteOtherSessions ( userId: string, deviceId: string ): Promise<number> {
    const result = await this.db.query(
      `DELETE FROM public."securityDevice"
      WHERE "userId" = $1
        AND "deviceId" <> $2`,
      [userId, deviceId]
    );

    return result.rowCount;
  }

}

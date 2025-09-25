import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Pool } from 'pg';
import { EmailConfirmation } from "../domain/email-confirmation.entity";
import { add } from "date-fns/add";

@Injectable()
export class EmailConfirmationRepository {

  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  async save(dto: EmailConfirmation): Promise<string> {
    if ( dto.id ) {
      const result = await this.db.query(
        `
        UPDATE public."emailConfirmation"
        SET 
          "userId"=$1, 
          "isEmailConfirmed"=$2, 
          "expirationDate"=$3, 
          "confirmationCode"=$4, 
          "updatedAt"=CURRENT_TIMESTAMP
        WHERE id=$5
        RETURNING id; `,
        [
          Number(dto.userId),
          dto.isEmailConfirmed,
          dto.expirationDate,
          dto.confirmationCode,
          dto.id
        ]
      );
      //TODO добавить норм обработку ошибки
      if (!result.rows || result.rows.length === 0 || !result.rows[0].id) {
        throw new Error('Failed to UPDATE: no ID returned from database');
      }

      return result.rows[0].id.toString();
    } 

    const result = await this.db.query(
      `
      INSERT INTO public."emailConfirmation" (
        "userId", 
        "isEmailConfirmed", 
        "expirationDate", 
        "confirmationCode", 
        "createdAt", 
        "updatedAt"
      ) 
        VALUES( $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id;
      `,
      [
        Number(dto.userId),
        dto.isEmailConfirmed,
        dto.expirationDate,
        dto.confirmationCode,
      ]
    );
    //TODO добавить норм обработку ошибки
    if (!result.rows || result.rows.length === 0 || !result.rows[0].id) {
      throw new Error('Failed to create: no ID returned from database');
    }

    return result.rows[0].id.toString();
  }
  
  async findbyUserId( userId: number ): Promise<EmailConfirmation | null> {
    const result = await this.db.query(
      `
      SELECT 
        id, 
        "userId", 
        "isEmailConfirmed", 
        "expirationDate", 
        "confirmationCode", 
        "createdAt", 
        "updatedAt"
      FROM public."emailConfirmation"
      WHERE "userId"=$1
      LIMIT 1;
      `,
      [ userId ]
    );

    return result.rows[0] ?? null;
  }

  async updateEmailConfirmationCode( code: string, userId: number ): Promise<void> {
    const emailConfirmation = await this.findbyUserId( userId );
    if ( emailConfirmation ) {
      emailConfirmation.expirationDate = add(new Date(), { hours: 1 });
      emailConfirmation.confirmationCode = code;
      await this.save( emailConfirmation );
      return;
    }
    throw new Error('Failed to update: no previos data in database');
  }

  async findUserByConfirmationCode ( code: string ): Promise<EmailConfirmation | null> {
    const result = await this.db.query(
      ` 
      SELECT e.id, e."userId", e."isEmailConfirmed", e."expirationDate", e."confirmationCode", e."createdAt", e."updatedAt"
      FROM public."emailConfirmation" e
      INNER JOIN public.users u ON e."userId" = u.id
      WHERE e."confirmationCode" = $1 AND u."deletedAt" IS NULL
      LIMIT 1;`,
      [ code ]
    );

    return result.rows[0] ?? null;    
  }
}

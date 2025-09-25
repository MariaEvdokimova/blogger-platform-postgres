import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Pool } from 'pg';
import { User } from "../domain/user.entity";
import { UserModelType } from "../domain/mongoose/user.entity";
import { Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { UserMapper } from "../domain/mappers/user.mapper";

@Injectable()
export class UsersRepository {

  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
    @InjectModel(User.name) private UserModel: UserModelType
  ) {}

  async create(user: User): Promise<string> {
    const result = await this.db.query(
      `
      INSERT INTO public.users (
        login, 
        "passwordHash", 
        email, 
        "createdAt", 
        "updatedAt")
        VALUES( $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id;
      `,
      [
        user.login,
        user.passwordHash,
        user.email,
      ]
    );
//TODO добавить норм обработку ошибки
    if (!result.rows || result.rows.length === 0 || !result.rows[0].id) {
      throw new Error('Failed to create user: no ID returned from database');
    }

    return result.rows[0].id.toString();
  }

  async softDelete(id: number): Promise<void> {
    await this.db.query(
      `
      UPDATE public.users
      SET "deletedAt" = CURRENT_TIMESTAMP,
        "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id;`,
      [id]
    );
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.db.query(
      ` 
      SELECT 
        id, login, "passwordHash", email, "deletedAt", "createdAt", "updatedAt"
      FROM 
        public.users
      WHERE id = $1 AND "deletedAt" IS NULL;`,
      [ id ]
    );

    const row = result.rows[0];
    if (!row) return null;

    const user = new User(
      row.login,
      row.email,
      row.passwordHash
    );

    user.id = row.id;
    user.createdAt = row.createdAt;
    user.updatedAt = row.updatedAt;
    user.deletedAt = row.deletedAt;

    return user;
  }

  async findOrNotFoundFail(id: number): Promise<User> {
    const result = await this.db.query(
      ` 
      SELECT 
        *
      FROM 
        public.users
      WHERE id = $1 AND "deletedAt" IS NULL;`,
      [ id ]
    );

    if (!result || result.rows.length === 0) {
      throw new NotFoundException('post not found');
    }

    return result.rows[0];
  }

  async doesExistByLoginOrEmail(
    login: string,
    email: string
  ): Promise<User | null> {
    const result = await this.db.query(
      ` 
      SELECT 
        id, login, "passwordHash", email, "deletedAt", "createdAt", "updatedAt"
      FROM 
        public.users
      WHERE (login = $1 OR email = $2) AND "deletedAt" IS NULL;`,
      [ login, email ]
    );

    const user = result.rows[0] ?? null;
    return user ? UserMapper.fromDb(user) : null;
  }

  async findByEmail( email: string ): Promise<User | null> {
    const result = await this.db.query(
      ` 
      SELECT 
        id, login, "passwordHash", email, "deletedAt", "createdAt", "updatedAt"
      FROM 
        public.users
      WHERE "email" = $1 AND "deletedAt" IS NULL
      LIMIT 1;`,
      [ email ]
    );

    const user = result.rows[0] ?? null;
    return user ? UserMapper.fromDb(user) : null;
  }

  async updatePasswordHash( passwordHash: string, id: string ): Promise<void> {
    await this.db.query(
      `
      UPDATE public.users
      SET "passwordHash" = $1,
        "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $2;`,
      [ passwordHash, id ]
    );
  }

  async findByUserIds(userIds: Types.ObjectId[]): Promise<User[]>{
    return this.UserModel.find({
      _id: { $in: userIds }
    }).exec();
  }

}

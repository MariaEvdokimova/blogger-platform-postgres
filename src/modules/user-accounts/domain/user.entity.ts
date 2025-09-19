import { CreateUserDomainDto } from "./dto/create-user.domain.dto";

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
  match: /^[a-zA-Z0-9_-]*$/,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  minLength: 5,
  maxLength: 500,
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

export class User {
  id: string; 
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  deletedAt: Date | null = null;
 
  constructor(
    public login: string,
    public email: string,
    public passwordHash: string,
  ){}

  static createInstance(dto: CreateUserDomainDto): User {
    return new User(
      dto.login,
      dto.email,
      dto.passwordHash,
    );
  }
 
  /**
   * Marks the user as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
   * DDD continue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  } 
}

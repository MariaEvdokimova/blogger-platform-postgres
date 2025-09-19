import { User } from "../user.entity";


export class UserMapper {
  static fromDb(row: any): User {
    const user = new User(row.login, row.email, row.passwordHash);

    user.id = row.id.toString();
    user.createdAt = row.createdAt;
    user.updatedAt = row.updatedAt;
    user.deletedAt = row.deletedAt;

    return user;
  }
}

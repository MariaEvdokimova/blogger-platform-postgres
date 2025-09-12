import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserDto } from "../../../../user-accounts/dto/create-user.dto";
import { UsersRepository } from "../../../../user-accounts/infrastructure/users.repository";
import { UsersFactory } from "../../factories/users.factory";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}
/**
 * Создание администратором пользователя через админскую панель
 */
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand, string>
{
  constructor(
    private usersRepository: UsersRepository,
    private usersFactory: UsersFactory,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<string> {
    const userWithTheSameLoginOrMail = await this.usersRepository.doesExistByLoginOrEmail(
      dto.login,
      dto.email,
    );

    if ( userWithTheSameLoginOrMail ) {
      if ( userWithTheSameLoginOrMail.email === dto.email ) {
        throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same emil already exists',
        extensions: [{
          message: 'User with the same email already exists',
          field: 'email'
        }]
      });
      } else {  
        throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same login already exists',
        extensions: [{
          message: 'User with the same login already exists',
          field: 'login'
        }]
      });
      }
    }

    const user = await this.usersFactory.create(dto);

    user.isEmailConfirmed = true;
    await this.usersRepository.save(user);

    return user._id.toString();
  }
}

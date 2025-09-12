import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { RegistrationConfirmationInputDto } from "../../../../user-accounts/api/input-dto/registration-confirmation.input-dto";
import { UsersRepository } from "../../../../user-accounts/infrastructure/users.repository";

export class RegistrationConfirmationCommand {
  constructor(public dto: RegistrationConfirmationInputDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(
    private usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: RegistrationConfirmationCommand): Promise<void> {
    const user = await this.usersRepository.findUserByConfirmationCode( dto.code );
    if ( !user 
      || user.isEmailConfirmed === true
      || user.confirmationCode !== dto.code
      ||( user.expirationDate && user.expirationDate < new Date())
    ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Code incorrect',
        extensions: [{
          message: 'Code incorrect',
          field: 'code'
        }]
      });
    }

    user.updateEmailConfirmed();
    await this.usersRepository.save( user );
  }
}
    
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../../../modules/user-accounts/infrastructure/users.repository";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { NewPasswordInputDto } from "../../../../../modules/user-accounts/api/input-dto/new-password.input-dto";
import { CryptoService } from "../../services/crypto.service";

export class NewPasswordCommand {
  constructor(public dto: NewPasswordInputDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase
  implements ICommandHandler<NewPasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async execute({ dto }: NewPasswordCommand): Promise<void> {
    const { newPassword, recoveryCode } = dto;
    
    const user = await this.usersRepository.findUserByConfirmationCode( recoveryCode );
    if ( !user 
      || (user.expirationDate && user.expirationDate < new Date())
    ){
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Code incorrect',
      });      
    }

    const passwordHash = await this.cryptoService.createPasswordHash( newPassword );

    user.updatePasswordHash( passwordHash );
    await this.usersRepository.save( user );
  }
}

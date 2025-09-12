import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../../../../user-accounts/domain/user.entity";
import { UsersRepository } from "../../../../user-accounts/infrastructure/users.repository";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { PasswordRecoveryInputDto } from "../../../../user-accounts/api/input-dto/password-recovery.input-dto";
import { UuidService } from "../../services/uuid.service";
import { UserRegisteredEvent } from "../../../../user-accounts/domain/events/user-registered.event";
import { EmailExamples } from "../../../../notifications/email-examples";

export class PasswordRecoveryCommand {
  constructor(public dto: PasswordRecoveryInputDto) {}
}

/**
 * Создание администратором пользователя через админскую панель
 */
@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    @InjectModel(User.name)
    private usersRepository: UsersRepository,
    private uuidService: UuidService,
    private eventBus: EventBus,
    private emailExamples: EmailExamples,
  ) {}

  async execute({ dto }: PasswordRecoveryCommand): Promise<void> {
    try {
      const user = await this.usersRepository.findByEmail( dto.email );

      if ( !user ) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: ''         
        })
      }

      const code = this.uuidService.generate();

      user.setConfirmationCode( code );
      await this.usersRepository.save( user );

      this.eventBus.publish(new UserRegisteredEvent(user.email, code, this.emailExamples.passwordRecoveryEmail));
    } catch {
      //transaction.rollback();
    }
  }
}

import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../../user-accounts/infrastructure/users.repository";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { UuidService } from "../../services/uuid.service";
import { EmailExamples } from "../../../../notifications/email-examples";
import { UserRegisteredEvent } from "../../../../user-accounts/domain/events/user-registered.event";
import { RegistrationEmailResendingInputDto } from "../../../../user-accounts/api/input-dto/registration-email-resending.input-dto";

export class RegistrationEmailResendingCommand {
  constructor(public dto: RegistrationEmailResendingInputDto) {}
}

/**
 * Регистрация пользователя через email на странице регистрации сайта
 */
@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private eventBus: EventBus,
    private usersRepository: UsersRepository,
    private uuidService: UuidService,
    private emailExamples: EmailExamples,
  ) {}

  async execute({ dto }: RegistrationEmailResendingCommand): Promise<void> {
    try {
      const user = await this.usersRepository.doesExistByLoginOrEmail( '', dto.email );
    if ( !user ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'user email doesnt exist',
        extensions: [{
          message: 'user email doesnt exist',
          field: 'email'
        }]
      });
    }
    if ( user.isEmailConfirmed === true) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'email is already confirmed',
        extensions: [{
          message: 'email is already confirmed',
          field: 'email'
        }]
      });
    }

    const newConfirmationCode = this.uuidService.generate();
    user.setConfirmationCode( newConfirmationCode );
    await this.usersRepository.save( user );

    this.eventBus.publish(new UserRegisteredEvent(user.email, newConfirmationCode, this.emailExamples.registrationEmail));
      // а могут просто накапливаться в сущности и в конце мы можем у неё
      // попросить данные ивенты, чтиобы опубликовать их
      // this.eventBus.publish(user.getEvents());
    } catch {
      // transaction.rollback();
    }
  }
}

import bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { User, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { CryptoService } from './services/crypto.service';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { UuidService } from './services/uuid.service';
import { EmailService } from '../../../modules/notifications/email.service';
import { EmailExamples } from '../../../modules/notifications/email-examples';
import { RegistrationConfirmationInputDto } from '../api/input-dto/registration-confirmation.input-dto';
import { RegistrationEmailResendingInputDto } from '../api/input-dto/registration-email-resending.input-dto';

@Injectable()
export class UsersService {
  constructor(
    //инжектирование модели в сервис через DI
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private uuidService: UuidService,
    private emailService: EmailService,    
    private emailExamples: EmailExamples,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
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

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password
    );

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }

  async registerUser(dto: CreateUserDto) {
    const createdUserId = await this.createUser(dto);
    
    const confirmCode = this.uuidService.generate();

    const user = await this.usersRepository.findOrNotFoundFail( createdUserId );

    user.setConfirmationCode(confirmCode);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(
        user.email, 
        confirmCode,
        this.emailExamples.registrationEmail
      )
      .catch(console.error);
  }

  async registrationConfirmation ( dto: RegistrationConfirmationInputDto ) {
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
      //throw new ValidationError( `Code incorrect`, 'code' );
    }

    user.updateEmailConfirmed();
    await this.usersRepository.save( user );
  }

  async registrationEmailResending ( dto: RegistrationEmailResendingInputDto) {
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
      //throw new ValidationError( 'user email doesnt exist', 'email');
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
      //throw new ValidationError( 'email is already confirmed', 'email');
    }

    const newConfirmationCode = this.uuidService.generate();

    user.setConfirmationCode( newConfirmationCode );
    await this.usersRepository.save( user );

    this.emailService
      .sendConfirmationEmail(
        user.email, 
        newConfirmationCode,
        this.emailExamples.registrationEmail
      )
      .catch(console.error);
  }
}

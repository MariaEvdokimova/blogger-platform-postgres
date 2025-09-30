import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { CryptoService } from './application/services/crypto.service';
import { UuidService } from './application/services/uuid.service';
import { EmailService } from '../notifications/email.service';
import { EmailExamples } from '../notifications/email-examples';
import { NotificationsModule } from '../notifications/notifications.module';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { LocalStrategy } from './guards/local/local.strategy';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { AuthController } from './api/auth.controller';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from './constants/auth-tokens.inject-constants';
import { CreateUserUseCase } from './application/usecases/admins/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/admins/delete-user.usecase';
import { LoginUserUseCase } from './application/usecases/users/login-user.usecase';
import { NewPasswordUseCase } from './application/usecases/users/new-password.usecase';
import { RegisterUserUseCase } from './application/usecases/users/register-user.usecase';
import { RegistrationConfirmationUseCase } from './application/usecases/users/registration-confirmation.usecase';
import { RegistrationEmailResendingUseCase } from './application/usecases/users/registration-email-resending.usecase';
import { UsersFactory } from './application/factories/users.factory';
import { PasswordRecoveryUseCase } from './application/usecases/users/password-recovery.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { GetUsersQueryHandler } from './application/queries/get-users.query';
import { GetMeQueryHandler } from './application/queries/get-me.query';
import { AuthService } from './application/services/auth.service';
import { UserAccountsConfig } from './config/user-accounts.config';
import { DeleteDeviceByIdUseCase } from './application/usecases/devices/delete-device-by-id.usecase';
import { DeleteDevicesUseCase } from './application/usecases/devices/delete-devices.usecase';
import { RefreshTokenUseCase } from './application/usecases/users/refresh-token.usecase';
import { GetSecurityDevicesQueryHandler } from './application/queries/get-security-devices.query';
import { SecurityDevicesController } from './api/security-devices.controller';
import { SecurityDevicesQueryRepository } from './infrastructure/query/security-devices.query-repository';
import { SecurityDeviceRepository } from './infrastructure/security-devices.repository';
import { CookieService } from './application/services/cookie.service';
import { SecurityDevicesFactory } from './application/factories/security-devices.factory';
import { LogoutUseCase } from './application/usecases/users/logout-user.usecase';
import { EmailConfirmationRepository } from './infrastructure/email-confirmation.repository';
import { EmailConfirmationFactory } from './application/factories/email-confirmation.factory';
 
const commandHandlers = [
  CreateUserUseCase,
  DeleteUserUseCase,
  LoginUserUseCase,
  NewPasswordUseCase,
  RegisterUserUseCase,
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  PasswordRecoveryUseCase,
  DeleteDeviceByIdUseCase,
  DeleteDevicesUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
];

const queryHandlers = [
  GetUsersQueryHandler,
  GetMeQueryHandler,
  GetSecurityDevicesQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [    
    ...commandHandlers,
    ...queryHandlers,
    UsersRepository,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.accessTokenSecret,
          signOptions: { expiresIn: userAccountConfig.accessTokenExpireIn },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.refreshTokenSecret,
          signOptions: { expiresIn: userAccountConfig.refreshTokenExpireIn },
        });
      },
      inject: [UserAccountsConfig],
    },

    UsersQueryRepository,
    AuthService, 
    AuthQueryRepository,
    CryptoService,
    UuidService,
    EmailService,
    EmailExamples,
    JwtStrategy,
    LocalStrategy,
    UsersFactory,    
    UserAccountsConfig,
    SecurityDevicesQueryRepository,
    SecurityDeviceRepository,
    CookieService,
    SecurityDevicesFactory,
    EmailConfirmationFactory,
    EmailConfirmationRepository,
  ],
  exports: [JwtStrategy, UsersRepository],
})
export class UserAccountsModule {}

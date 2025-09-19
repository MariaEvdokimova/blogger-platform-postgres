import { Injectable } from "@nestjs/common";
import { EmailConfirmation } from "../../domain/email-confirmation.entity";
import { CreateEmailConfirmationDto } from "../../dto/create-email-confirmation.dto";

@Injectable()
export class EmailConfirmationFactory {
  constructor(
  ) {}
  
  async create(dto: CreateEmailConfirmationDto): Promise<EmailConfirmation> {
     const emailConfirmation = EmailConfirmation.createInstance({
      userId: Number(dto.userId),
      isEmailConfirmed: dto.isEmailConfirmed ?? false,
      expirationDate: dto.expirationDate ?? null,
      confirmationCode: dto.confirmationCode ?? null
    });
    return emailConfirmation;
  }
}

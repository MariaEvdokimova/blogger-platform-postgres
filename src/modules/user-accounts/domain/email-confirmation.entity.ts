import { CreateEmailConfirmationDomainDto } from "./dto/create-email-confirmation.domain.dto";

export class EmailConfirmation {
  id?: number; 
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
 
  constructor(
    public userId: number,    
    public isEmailConfirmed: boolean = false,
    public expirationDate: Date | null = null,
    public confirmationCode: string | null = null,
  ){}

  static createInstance(dto: CreateEmailConfirmationDomainDto): EmailConfirmation {
    return new EmailConfirmation(
      dto.userId,
      dto.isEmailConfirmed,
      dto.expirationDate,
      dto.confirmationCode
    );
  }
}

import { IsStringWithTrim } from "../../../../core/decorators/validation/is-string-with-trim";
import { emailConstraints } from "../../domain/user.entity";
import { IsEmail, Matches } from "class-validator";

export class RegistrationEmailResendingInputDto {
  @IsStringWithTrim(emailConstraints.minLength, emailConstraints.maxLength)
  @IsEmail()
 // @Matches(emailConstraints.match)
  email: string;
}

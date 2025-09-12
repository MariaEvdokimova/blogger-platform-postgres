import { IsStringWithTrim } from "../../../../core/decorators/validation/is-string-with-trim";
import { emailConstraints } from "../../domain/user.entity";
import { Matches } from "class-validator";

export class PasswordRecoveryInputDto {
  @IsStringWithTrim(emailConstraints.minLength, emailConstraints.maxLength)
  @Matches(emailConstraints.match)
  email: string
}

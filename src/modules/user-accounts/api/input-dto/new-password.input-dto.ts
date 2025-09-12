import { ApiProperty } from "@nestjs/swagger";
import { passwordConstraints } from "../../domain/user.entity";
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';

export class NewPasswordInputDto {
  @ApiProperty({
    minLength: passwordConstraints.minLength,
    maxLength: passwordConstraints.maxLength,
  })
  @IsStringWithTrim(passwordConstraints.minLength, passwordConstraints.maxLength)
  newPassword: string;
  recoveryCode: string;
}

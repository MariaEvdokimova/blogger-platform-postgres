import { IsEnum } from "class-validator";
import { LikeStatus } from "../../domain/likes.entity";

export class UpdatePostLikeStatusInputDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}

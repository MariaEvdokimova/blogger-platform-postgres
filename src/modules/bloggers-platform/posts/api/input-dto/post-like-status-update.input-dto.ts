import { IsEnum } from "class-validator";
import { LikeStatus } from "../../domain/extendedLikesInfo.entity";

export class UpdatePostLikeStatusInputDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}

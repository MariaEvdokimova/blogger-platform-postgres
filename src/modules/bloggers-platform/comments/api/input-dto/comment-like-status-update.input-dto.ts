import { LikeStatus } from "../../domain/likesInfo.entity";
import { IsEnum } from "class-validator";

export class UpdateCommentLikeStatusInputDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}

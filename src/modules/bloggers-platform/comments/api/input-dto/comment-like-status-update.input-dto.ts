import { IsEnum } from "class-validator";
import { LikeStatus } from "../../domain/comment-like.entity";

export class UpdateCommentLikeStatusInputDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}

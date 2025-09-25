import { LikeStatus } from "../comment-like.entity";

export class CreateCommentLikeStatusDomainDto {
  commentId:	number;
  userId: number;
  status:	LikeStatus;
}

import { LikeStatus } from "../likesInfo.entity";

export class CreateCommentLikeStatusDomainDto {
  commentId:	string;
  userId: string;
  status:	LikeStatus;
}

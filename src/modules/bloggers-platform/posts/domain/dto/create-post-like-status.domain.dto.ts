import { LikeStatus } from "../likes.entity";

export class CreatePostLikeStatusDomainDto {
  postId:	number;
  userId: number;
  status:	LikeStatus;
}

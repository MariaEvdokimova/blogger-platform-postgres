import { LikeStatus } from "../extendedLikesInfo.entity";


export class CreatePostLikeStatusDomainDto {
  postId:	string;
  userId: string;
  status:	LikeStatus;
}

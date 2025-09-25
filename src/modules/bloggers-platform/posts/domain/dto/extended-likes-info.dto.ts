import { LikeStatus } from "../likes.entity";

export class ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLikes[];
}

export class NewestLikes {
  userId: String;
  login: String;
  addedAt: Date;
}
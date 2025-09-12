import { Types } from "mongoose";

export class CreateCommentDomainDto {
  content: string;
  userLogin: string;
  userId: Types.ObjectId;
  postId: string
}

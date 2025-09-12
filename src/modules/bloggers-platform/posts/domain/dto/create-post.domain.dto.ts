import { Types } from "mongoose";

export class CreatePostDomainDto {
  title:	string;
  shortDescription: string;
  content:	string;
  blogId: Types.ObjectId;
  blogName: string;
}

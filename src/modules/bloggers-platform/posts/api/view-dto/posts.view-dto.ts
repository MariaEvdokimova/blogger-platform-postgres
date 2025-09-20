import { ExtendedLikesInfo, LikeStatus } from "../../domain/extendedLikesInfo.entity";

export class PostViewDto {
  id:	string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo

  static mapToView(post): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id!.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;

    dto.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo?.likesCount || 0,
      dislikesCount: post.extendedLikesInfo?.dislikesCount || 0,
      myStatus: post.extendedLikesInfo?.myStatus || LikeStatus.None, 
      newestLikes: post.extendedLikesInfo?.newestLikes || []
    };

    return dto;
  }
}

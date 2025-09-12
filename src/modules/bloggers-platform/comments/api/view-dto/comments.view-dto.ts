import { CommentDocument } from '../../domain/comment.entity';
import { LikeStatus } from '../../domain/likesInfo.entity';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string,
    userLogin: string,
  };
  likesInfo: {
    likesCount: number,
    dislikesCount: number,
    myStatus: string,
  };
  createdAt: Date

  static mapToView(comment: CommentDocument): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId.toString(),
      userLogin: comment.commentatorInfo.userLogin
    };
    //dto.likesInfo.myStatus = comment.likesInfo.myStatus;
    dto.createdAt = comment.createdAt;

    dto.likesInfo = {
      likesCount: comment?.likesInfo?.likesCount || 0,
      dislikesCount: comment?.likesInfo?.dislikesCount || 0,
      myStatus: comment?.likesInfo.myStatus || LikeStatus.None, 
    };

    return dto;
  }
}

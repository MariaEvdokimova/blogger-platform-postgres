import { CreateCommentLikeStatusDomainDto } from "./dto/create-comment-like-status.domain.dto";

export enum LikeStatus {
  None = 'None', 
  Like = 'Like', 
  Dislike = 'Dislike',
 };

export class CommentLike {
  id?: number;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  deletedAt: Date | null = null;

  constructor (
    public commentId: number,
    public userId: number,
    public status: LikeStatus,
  ){}

  static createInstance(dto: CreateCommentLikeStatusDomainDto): CommentLike {
    return new CommentLike(
      dto.commentId,
      dto.userId,
      dto.status,
    )
  }

  /**
   * update Like Status
   */
  updateLikeStatus ( status: LikeStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }
}
 
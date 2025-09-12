import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CommentViewDto } from "../../api/view-dto/comments.view-dto";
import { CommentsQueryRepository } from "../../infrastructure/query/comments.query-repository";
import { CommentsLikesQueryRepository } from "../../infrastructure/query/comment-likes.query.repository";
import { LikeStatus } from "../../domain/likesInfo.entity";

export class GetCommenByIdQuery {
  constructor(
    public id: string,
    public userId: string
  ) {}
}

@QueryHandler(GetCommenByIdQuery)
export class GetCommentByIdQueryHandler
  implements IQueryHandler<GetCommenByIdQuery, CommentViewDto>
{
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsLikesQueryRepository: CommentsLikesQueryRepository,
  ) {}

  async execute({ id, userId }: GetCommenByIdQuery) {
    const comment = await this.commentsQueryRepository.getByIdOrNotFoundFail( id );
    
    const likeStatus = userId
      ? await this.commentsLikesQueryRepository.findStatusByUserIdAndPostId( userId, id)
      : LikeStatus.None;

    const commentWithMyStatus = {
      ...comment,
      likesInfo: {
          ...comment.likesInfo,
          myStatus: likeStatus || LikeStatus.None
        }
    };

    return commentWithMyStatus;
  }
}

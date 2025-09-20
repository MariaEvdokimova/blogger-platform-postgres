import { IQueryHandler, QueryBus, QueryHandler } from "@nestjs/cqrs";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query-repository";
import { GetCommentsQueryParams } from "../../../../bloggers-platform/comments/api/input-dto/get-comments-query-params.input-dto";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { CommentViewDto } from "../../../../bloggers-platform/comments/api/view-dto/comments.view-dto";
import { GetCommentsByPostIdQuery } from "../../../../bloggers-platform/comments/application/queries/get-comments-by-post-id.query";
import { CommentsLikesQueryRepository } from "src/modules/bloggers-platform/comments/infrastructure/query/comment-likes.query.repository";
import { LikeStatus } from "../../domain/extendedLikesInfo.entity";

export class GetCommentsPostByIdQuery {
  constructor(
    public postId: string, 
    public query: GetCommentsQueryParams,
    public userId: string
  ) {}
}

@QueryHandler(GetCommentsPostByIdQuery)
export class GetCommentsPostByIdQueryHandler
  implements IQueryHandler<GetCommentsPostByIdQuery, PaginatedViewDto<CommentViewDto[]>>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private readonly queryBus: QueryBus,
    private commentsLikesQueryRepository: CommentsLikesQueryRepository,
  ) {}

  async execute({ postId, query, userId }: GetCommentsPostByIdQuery) {
    await this.postsQueryRepository.getByIdOrNotFoundFail( Number(postId) );
    const comments = await this.queryBus.execute( new GetCommentsByPostIdQuery( postId, query ));

    const commentIds = comments.items.map(post => post.id);
    const likes = userId 
      ?await this.commentsLikesQueryRepository.findByCommentIds(commentIds, userId)
      : [];

    //словарь для поиска статуса лайка
    const likesMap = new Map<string, LikeStatus>(
      likes.map(like => [like.commentId.toString(), like.status || LikeStatus.None])
    );

    const modifiedItems = comments.items.map(comment => ({
      ...comment,
      likesInfo: {
        ...comment.likesInfo,
        myStatus: likesMap.get(comment.id) || LikeStatus.None
      }
    })); 
  
    return {
      ...comments, 
      items: modifiedItems,
    };
  }
}

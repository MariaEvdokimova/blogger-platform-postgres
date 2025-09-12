import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CommentViewDto } from "../../api/view-dto/comments.view-dto";
import { CommentsQueryRepository } from "../../infrastructure/query/comments.query-repository";
import { GetCommentsQueryParams } from "../../api/input-dto/get-comments-query-params.input-dto";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";

export class GetCommentsByPostIdQuery {
  constructor(
    public postId: string, 
    public query: GetCommentsQueryParams
  ) {}
}

@QueryHandler(GetCommentsByPostIdQuery)
export class GetCommentsByPostIdQueryHandler
  implements IQueryHandler<GetCommentsByPostIdQuery, PaginatedViewDto<CommentViewDto[]>>
{
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  async execute({ query, postId }: GetCommentsByPostIdQuery) {
    return this.commentsQueryRepository.getCommentsInPost( query, postId );
  }
}

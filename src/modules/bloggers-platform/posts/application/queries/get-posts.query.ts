import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetPostsQueryParams } from "../../api/input-dto/get-posts-query-params.input-dto";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query-repository";
import { PostsLikesQueryRepository } from "../../infrastructure/query/post-likes.query.repository";

export class GetPostsQuery {
  constructor(
    public dto: GetPostsQueryParams,
    public userId: number
  ) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler
  implements IQueryHandler<GetPostsQuery, PaginatedViewDto<PostViewDto[]> >
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsLikesQueryRepository: PostsLikesQueryRepository,
  ) {}

  async execute({ dto, userId }: GetPostsQuery) {
    const posts = await this.postsQueryRepository.getAll( dto, userId );
    return posts;
  }
}

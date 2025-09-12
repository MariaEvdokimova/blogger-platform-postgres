import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetPostsQueryParams } from "../../api/input-dto/get-posts-query-params.input-dto";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query-repository";
import { PostsLikesQueryRepository } from "../../infrastructure/query/post-likes.query.repository";
import { LikeStatus } from "../../domain/extendedLikesInfo.entity";

export class GetPostsQuery {
  constructor(
    public dto: GetPostsQueryParams,
    public userId: string
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
    //console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!userId ', userId );
    const posts = await this.postsQueryRepository.getAll( dto );
    
    const postIds = posts.items.map(post => post.id);
    const likes = userId 
      ?await this.postsLikesQueryRepository.findByPostIds(postIds, userId)
      : [];

    //словарь для поиска статуса лайка
    const likesMap = new Map<string, LikeStatus>(
      likes.map(like => [like.postId.toString(), like.status || LikeStatus.None])
    );

    const modifiedItems = posts.items.map(post => ({
      ...post,
      extendedLikesInfo: {
        ...post.extendedLikesInfo,
        myStatus: likesMap.get(post.id) || LikeStatus.None
      }
    })); 

    return {
      ...posts, 
      items: modifiedItems,
    };
  }
}

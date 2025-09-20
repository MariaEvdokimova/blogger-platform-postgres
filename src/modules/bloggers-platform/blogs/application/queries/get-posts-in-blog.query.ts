import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsQueryRepository } from "../../infrastructure/query/blogs.query-repository";
import { PostsQueryRepository } from "../../../../bloggers-platform/posts/infrastructure/query/posts.query-repository";
import { GetPostsQueryParams } from "../../../../bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { PostViewDto } from "../../../../bloggers-platform/posts/api/view-dto/posts.view-dto";
import { PostsLikesQueryRepository } from "src/modules/bloggers-platform/posts/infrastructure/query/post-likes.query.repository";
import { LikeStatus } from "src/modules/bloggers-platform/comments/domain/likesInfo.entity";

export class GetPostsInBlogQuery {
  constructor(
    public blogId: string,
    public query: GetPostsQueryParams,
    public userId: string
  ) {}
}

@QueryHandler(GetPostsInBlogQuery)
export class GetPostsInBlogQueryHandler
  implements IQueryHandler<GetPostsInBlogQuery, PaginatedViewDto<PostViewDto[]> >
{
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private postsLikesQueryRepository: PostsLikesQueryRepository,
  ) {}

  async execute( { blogId, query, userId }: GetPostsInBlogQuery) {
    await this.blogsQueryRepository.getByIdOrNotFoundFail( Number(blogId) );
    const posts = await this.postsQueryRepository.getPostsInBlog( query, Number(blogId) );

   /* const postIds = posts.items.map(post => post.id);
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
    */
   return posts
  }
}

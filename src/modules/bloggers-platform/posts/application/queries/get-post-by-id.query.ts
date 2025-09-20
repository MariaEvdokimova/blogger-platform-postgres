import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query-repository";
import { PostsLikesQueryRepository } from "../../infrastructure/query/post-likes.query.repository";
import { LikeStatus } from "../../domain/extendedLikesInfo.entity";

export class GetPostByIdQuery {
  constructor(
    public id: string,
    public userId: string
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler
  implements IQueryHandler<GetPostByIdQuery, PostViewDto>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsLikesQueryRepository: PostsLikesQueryRepository,
  ) {}

  async execute({ id, userId }: GetPostByIdQuery) {
    const post = await this.postsQueryRepository.getByIdOrNotFoundFail( Number(id) );
    // const likeStatus = userId
    //   ? await this.postsLikesQueryRepository.findStatusByUserIdAndPostId( userId, id)
    //   : LikeStatus.None;

    // const postWithMyStatus = {
    //   ...post,
    //   extendedLikesInfo: {
    //     ...post.extendedLikesInfo,
    //     myStatus: likeStatus || LikeStatus.None
    //   }
    // };

    return post;//postWithMyStatus;
  }
}

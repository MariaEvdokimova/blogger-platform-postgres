import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { UpdatePostLikeStatusInputDto } from "../../api/input-dto/post-like-status-update.input-dto";
import { UsersRepository } from "../../../../user-accounts/infrastructure/users.repository";
import { PostsRepository } from "../../infrastructure/posts.repository";
import { PostLikesRepository } from "../../infrastructure/posts-likes.repository";
import { PostLikeStatusFactory } from "../factories/post-like-status.factory";

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: number, 
    public dto: UpdatePostLikeStatusInputDto,
    public userId: number
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private postRepository: PostsRepository,
    private postLikesRepository: PostLikesRepository,
    private postLikeStatusFactory: PostLikeStatusFactory,
  ) {
    //console.log('UpdatePostLikeUseCase created');
  }

  async execute({ postId, dto, userId }: UpdatePostLikeStatusCommand): Promise<void> {
    const user = await this.usersRepository.findById( userId );
      if ( !user ) {
        throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'NotFound'
      });
      }

    const post = await this.postRepository.findById( postId );
      if ( !post ) {
       throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'NotFound'
      });
    }
 
    let postLike = await this.postLikesRepository.findUserPostStatus( postId, userId );
    if ( postLike && postLike.status === dto.likeStatus) return;
    
    if ( !postLike ) {
      postLike = await this.postLikeStatusFactory.create({ 
        postId: Number(postId), 
        userId: Number(user.id), 
        status: dto.likeStatus
      });
    } else {
      postLike.updateLikeStatus( dto.likeStatus );
    }

    await this.postLikesRepository.save( postLike );
    return;
  }
}

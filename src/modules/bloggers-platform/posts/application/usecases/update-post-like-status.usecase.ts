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
    public postId: string, 
    public dto: UpdatePostLikeStatusInputDto,
    public userId: string
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
    const user = await this.usersRepository.findById( Number(userId) );
      if ( !user ) {
        throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'NotFound'
      });
      }

    const post = await this.postRepository.findById( Number(postId) );
      if ( !post ) {
       throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'NotFound'
      });
    }
 
    const userPostStatus = await this.postLikesRepository.findUserPostStatus( postId, userId );
    if ( userPostStatus && userPostStatus.status === dto.likeStatus) return;

    //TODO
    //post.updateLikesInfo( dto.likeStatus, userPostStatus?.status);
    //await this.postRepository.save( post );

    if ( userPostStatus) {        
      userPostStatus.updateLikeStatus( dto.likeStatus );
      await this.postLikesRepository.save( userPostStatus );             
    } else {
      const newStatus = await this.postLikeStatusFactory.create({ postId, userId, status: dto.likeStatus});
      await this.postLikesRepository.save( newStatus );
    }

    const lastThreeLikes = await this.postLikesRepository.findLastThreeLikes(postId);
    const userIds = lastThreeLikes.map(lastLike => lastLike.userId);
    const users = await this.usersRepository.findByUserIds( userIds ) || [];

    const usersMap = new Map< string, string>(
      users.map(user => [user.id.toString(), user.login || ''])
    );
  
    const newestLikes = lastThreeLikes.map( lastLike => {
      return { 
        addedAt: lastLike.createdAt,
        userId: lastLike.userId.toString(), 
        login: usersMap.get(lastLike.userId.toString()) || '',
      }
    });

    //TODO
    //post.updateNewestLikes( newestLikes );  
    //await this.postRepository.save( post );

    return;
  }
}

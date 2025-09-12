import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateCommentLikeStatusInputDto } from "../../api/input-dto/comment-like-status-update.input-dto";
import { UserContextDto } from "../../dto/user-context.dto";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { CommentLikesRepository } from "../../infrastructure/comment-likes.repository";
import { CommentsRepository } from "../../infrastructure/comments.repository";
import { CommentLikeStatusFactory } from "../factories/comment-like-status.factory";

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: string,
    public dto: UpdateCommentLikeStatusInputDto,
    public user: UserContextDto
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase
  implements ICommandHandler<UpdateCommentLikeStatusCommand, void>
{
  constructor(
    private commentLikesRepository: CommentLikesRepository,
    private commentsRepository: CommentsRepository,
    private commentLikeStatusFactory: CommentLikeStatusFactory
  ) {
    //console.log('UpdateCommentLikeUseCase created');
  }

  async execute({ commentId, dto, user }: UpdateCommentLikeStatusCommand): Promise<void> {
    const { likeStatus } = dto;
    const comment = await this.commentsRepository.findOrNotFoundFail( commentId );
   
    const userCommentStatus = await this.commentLikesRepository.findUserCommentStatus( commentId, user.id );
    if ( userCommentStatus && userCommentStatus.status === likeStatus) return;

    comment.updateLikesInfo( likeStatus, userCommentStatus?.status );

    await this.commentsRepository.save( comment );

    if ( userCommentStatus) {
      userCommentStatus.updateLikeStatus( likeStatus );
      await this.commentLikesRepository.save( userCommentStatus );   
      return;   
    }

    const newLikeStatus = await this.commentLikeStatusFactory.create({ commentId, userId: user.id, status: likeStatus});
    await this.commentLikesRepository.save( newLikeStatus );
    
    return;
  }
}

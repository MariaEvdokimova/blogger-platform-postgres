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
    public commentId: number,
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
    this.commentsRepository.findOrNotFoundFail( commentId );
   
    let commentLike = await this.commentLikesRepository.findUserCommentStatus( commentId, Number(user.id) );
    if ( commentLike && commentLike.status === likeStatus) return;

    if ( !commentLike ) {
      commentLike = await this.commentLikeStatusFactory.create({ 
        commentId: Number(commentId), 
        userId: Number(user.id), 
        status: likeStatus
      });
    } else {
      commentLike.updateLikeStatus( likeStatus );
    }

    await this.commentLikesRepository.save( commentLike );
    return;
  }
}

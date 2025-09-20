import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentInputDto } from "./../../../../bloggers-platform/comments/api/input-dto/comment.input-dto";
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { UsersRepository } from "../../../../user-accounts/infrastructure/users.repository";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { CommentFactory } from "./../../../../bloggers-platform/comments/application/factories/comment.factory";
import { CommentsRepository } from "./../../../../bloggers-platform/comments/infrastructure/comments.repository";

export class CreateCommentByPostIdCommand {
  constructor(
    public dto: CommentInputDto,
    public post: PostViewDto,
    public userId: string
  ) {}
}

@CommandHandler(CreateCommentByPostIdCommand)
export class CreateCommentByPostIdUseCase
  implements ICommandHandler<CreateCommentByPostIdCommand, string>
{
  constructor(
    private usersRepository: UsersRepository,
    private commentFactory: CommentFactory,
    private commentsRepository: CommentsRepository,
  ) {
   // console.log('CreateCommentByPostIdUseCase');
  }

  async execute({ dto, post, userId }: CreateCommentByPostIdCommand): Promise<string> {
    const user = await this.usersRepository.findById( Number(userId) );
    if ( !user ) {
      throw new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'NotFound'
    });
    }
    
    const newComment = await this.commentFactory.create( dto, post, user );
    const savedComment = await this.commentsRepository.save( newComment );
    return savedComment._id.toString();
  }
}

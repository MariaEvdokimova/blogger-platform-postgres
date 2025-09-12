import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infrastructure/posts.repository";
import { CreatePostInputDto } from "../../api/input-dto/posts.input-dto";
import { BlogDocument } from "../../../../bloggers-platform/blogs/domain/blog.entity";
import { PostsFactory } from "../factories/posts.factory";

export class CreatePostCommand {
  constructor(
    public dto: CreatePostInputDto,
    public blog: BlogDocument
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, string>
{
  constructor(
    private postsRepository: PostsRepository,
    private postsFactory: PostsFactory,
  ) {
    //console.log('CreatePostUseCase');
  }

  async execute({ dto, blog }: CreatePostCommand): Promise<string> {
    const post = await this.postsFactory.create( dto, blog );

    await this.postsRepository.save( post );

    return post._id.toString();
  }
}

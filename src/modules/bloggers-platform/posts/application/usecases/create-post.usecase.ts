import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infrastructure/posts.repository";
import { CreatePostInputDto } from "../../api/input-dto/posts.input-dto";
import { Blog } from "src/modules/bloggers-platform/blogs/domain/blog.entity";
import { PostsFactory } from "../factories/posts.factory";

export class CreatePostCommand {
  constructor(
    public dto: CreatePostInputDto,
    public blog: Blog
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, number>
{
  constructor(
    private postsRepository: PostsRepository,
    private postsFactory: PostsFactory,
  ) {
    //console.log('CreatePostUseCase');
  }

  async execute({ dto, blog }: CreatePostCommand): Promise<number> {
    const post = await this.postsFactory.create( dto, blog );
    const postId = await this.postsRepository.save( post );

    return postId;
  }
}

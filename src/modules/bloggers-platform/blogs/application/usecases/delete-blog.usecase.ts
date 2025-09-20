import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../../infrastructure/blogs.repository";

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase
  implements ICommandHandler<DeleteBlogCommand, void>
{
  constructor(private blogsRepository: BlogsRepository) {
    //console.log('DeleteBlogUseCase');
  }

  async execute({ blogId }: DeleteBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail( Number(blogId) );

    blog.makeDeleted();

    await this.blogsRepository.save(blog);
  }
}

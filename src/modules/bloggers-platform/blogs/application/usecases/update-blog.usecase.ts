import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateBlogDto } from "../../dto/update-blog.dto";
import { BlogsRepository } from "../../infrastructure/blogs.repository";

export class UpdateBlogCommand {
  constructor(
    public id: number, 
    public dto: UpdateBlogDto
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase
  implements ICommandHandler<UpdateBlogCommand>
{
  constructor(
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ id, dto }: UpdateBlogCommand) {
   const blog = await this.blogsRepository.findOrNotFoundFail( id );
  
    blog.update({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl
    });
    
    await this.blogsRepository.save(blog);
    return;
  }
}

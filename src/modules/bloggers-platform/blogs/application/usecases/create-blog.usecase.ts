import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateBlogInputDto } from "../../api/input-dto/blogs.input-dto";
import { BlogsRepository } from "../../infrastructure/blogs.repository";
import { BlogsFactory } from "../factories/blogs.factory";

export class CreateBlogCommand {
  constructor(public dto: CreateBlogInputDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, number>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsFactory: BlogsFactory,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<number> {
    const blog = await this.blogsFactory.create( dto );
    const blogId = await this.blogsRepository.save( blog );

    return blogId;
  }
}

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateBlogInputDto } from "../../api/input-dto/blogs.input-dto";
import { BlogsFactory } from "../factories/blogs.factory";
import { BlogsRepository } from "../../infrastructure/blogs.repository";

export class CreateBlogCommand {
  constructor(public dto: CreateBlogInputDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, string>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsFactory: BlogsFactory,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<string> {
   const blog = await this.blogsFactory.create( dto );

    await this.blogsRepository.save( blog );

    return blog._id.toString();
  }
}

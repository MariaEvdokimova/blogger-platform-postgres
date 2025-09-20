import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infrastructure/posts.repository";
import { UpdatePostDomainDto } from "../../dto/update-post.dto";
import { Types } from "mongoose";

export class UpdatePostCommand {
  constructor(
    public id: string, 
    public dto: UpdatePostDomainDto
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostCommand>
{
  constructor(
    private postsRepository: PostsRepository,
  ) {
    //console.log('UpdatePostUseCase');
  }

  async execute({ id, dto }: UpdatePostCommand): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail( Number(id) );
  
    post.update({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId 
    });
    
    await this.postsRepository.save(post);
    return;
  }
}

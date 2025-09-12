import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Post, PostModelType } from "../domain/post.entity";
import { PostsRepository } from '../infrastructure/posts.repository';
import { CreatePostDto } from "../dto/create-post.dto";
import { BlogDocument } from "../../blogs/domain/blog.entity";
import { Types } from "mongoose";
import { UpdatePostDomainDto } from "../dto/update-post.dto";

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
  ) {}

  async createPost(dto: CreatePostDto, blog: BlogDocument ): Promise<string> {
    const post = this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog._id,
      blogName: blog.name,
    });

    await this.postsRepository.save( post );

    return post._id.toString();
  }

  async updatePost( id: string, dto: UpdatePostDomainDto ): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);
  
    post.update({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: new Types.ObjectId(dto.blogId) 
    });
    
    await this.postsRepository.save(post);
    return;
  }

  async deletePost(id: string) {
    const post = await this.postsRepository.findOrNotFoundFail(id);

    post.makeDeleted();

    await this.postsRepository.save(post);
  }
}

import { Injectable } from "@nestjs/common";
import { CreatePostInputDto } from "../../api/input-dto/posts.input-dto";
import { Blog } from "src/modules/bloggers-platform/blogs/domain/blog.entity";
import { Post } from "../../domain/post.entity";

@Injectable()
export class PostsFactory {
  constructor(
  ) {}

  async create(
    dto: CreatePostInputDto,
    blog: Blog
  ): Promise<Post> {
    return Post.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog.id!,
      blogName: blog.name,
    });
  }
}

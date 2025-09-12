import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PostDocument, PostModelType, Post } from "../../domain/post.entity";
import { CreatePostInputDto } from "../../api/input-dto/posts.input-dto";
import { BlogDocument } from "../../../../bloggers-platform/blogs/domain/blog.entity";

@Injectable()
export class PostsFactory {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async create(
    dto: CreatePostInputDto,
    blog: BlogDocument
  ): Promise<PostDocument> {
    return this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog._id,
      blogName: blog.name,
    });
  }
}

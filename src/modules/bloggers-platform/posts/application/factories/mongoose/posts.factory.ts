import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CreatePostInputDto } from "../../../api/input-dto/posts.input-dto";
import { BlogDocument } from "../../../../blogs/domain/mongoose/blog.entity";
import { Post, PostDocument, PostModelType } from "../../../domain/mongoose/post.entity";

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
      blogId: blog.id,
      blogName: blog.name,
    });
  }
}

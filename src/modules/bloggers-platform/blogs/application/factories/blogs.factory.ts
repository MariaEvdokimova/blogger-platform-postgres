import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogDocument, BlogModelType } from "../../domain/blog.entity";
import { CreateBlogInputDto } from "../../api/input-dto/blogs.input-dto";

@Injectable()
export class BlogsFactory {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}
  async create(dto: CreateBlogInputDto): Promise<BlogDocument> {
     return this.BlogModel.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });
  }
}

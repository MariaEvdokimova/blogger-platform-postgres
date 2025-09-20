import { Injectable } from "@nestjs/common";
import { CreateBlogInputDto } from "../../api/input-dto/blogs.input-dto";
import { Blog } from "../../domain/blog.entity";

@Injectable()
export class BlogsFactory {
  constructor(    
  ) {}
  async create(dto: CreateBlogInputDto): Promise<Blog> {
    return Blog.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl
    });
  }
}

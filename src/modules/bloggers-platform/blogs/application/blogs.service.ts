import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogModelType } from "../domain/blog.entity";
import { BlogsRepository } from "../infrastructure/blogs.repository";
import { CreateBlogDto } from "../dto/create-blog.dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto ): Promise<string> {
    const blog = this.BlogModel.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepository.save( blog );

    return blog._id.toString();
  }

  async updateBlog( id: string, dto: UpdateBlogDto ): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);
  
    blog.update({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl
    });
    
    await this.blogsRepository.save(blog);
    return;
  }

  async deleteBlog(id: string) {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);

    blog.makeDeleted();

    await this.blogsRepository.save(blog);
  }
}

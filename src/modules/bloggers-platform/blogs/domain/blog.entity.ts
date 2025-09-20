import { CreateBlogDomainDto } from "./dto/create-blog.domain.dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";

export const nameConstraints = {
  minLength: 1,
  maxLength: 15,
};

export const descriptionConstraints = {
  minLength: 1,
  maxLength: 500,
};

export const websiteUrlConstraints = {
  minLength: 1,
  maxLength: 100,
  match: /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
};

export class Blog {
  id?: number;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  deletedAt: Date | null = null;

  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public isMembership: boolean = false,
  ){}
 
  static createInstance(dto: CreateBlogDomainDto): Blog {
    return new Blog(
      dto.name,
      dto.description,
      dto.websiteUrl,
    );
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
 
   update( dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
    this.updatedAt = new Date();
  }    
}

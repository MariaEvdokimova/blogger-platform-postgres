import { CreatePostDomainDto } from "./dto/create-post.domain.dto";
import { UpdatePostDomainDto } from "../dto/update-post.dto";

export const titleConstraints = {
  minLength: 1,
  maxLength: 30,
};

export const shortDescriptionConstraints = {
  minLength: 1,
  maxLength: 100,
};

export const contentConstraints = {
  minLength: 1,
  maxLength: 1000,
};

export class Post {
  id?: number; 
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  deletedAt: Date | null = null;

  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: number,
  ){}
 
  static createInstance(dto: CreatePostDomainDto): Post {
    return new Post(
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogId
    );
  }
 
  update( dto: UpdatePostDomainDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.updatedAt = new Date();
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}

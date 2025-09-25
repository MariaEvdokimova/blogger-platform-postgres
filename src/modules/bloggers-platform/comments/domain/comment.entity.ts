import { CreateCommentDomainDto } from "./dto/create-comment.domain.dto";

export const contentConstraints = {
  minLength: 20,
  maxLength: 300,
};

export class Comment {
  id?: number;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  deletedAt: Date | null = null;

  constructor (
    public content: string,
    public postId: number,
    public userId: number,
  ){}


  static createInstance(dto: CreateCommentDomainDto): Comment {
    return new Comment (
      dto.content,
      dto.postId,
      dto.userId
    )
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  updateContent( content: string ) {
    this.content = content;
    this.updatedAt = new Date();
  } 
}
 
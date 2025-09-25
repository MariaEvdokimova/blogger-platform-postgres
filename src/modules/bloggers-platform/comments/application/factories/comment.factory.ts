import { Injectable } from "@nestjs/common";
import { CommentInputDto } from "../../api/input-dto/comment.input-dto";
import { Comment } from "../../domain/comment.entity";

@Injectable()
export class CommentFactory {
  constructor(
  ) {}
  async create(dto: CommentInputDto, postId: number, userId: number): Promise<Comment> {
    return Comment.createInstance({
      content: dto.content,      
      postId: postId,
      userId: userId,
    });
  }
}

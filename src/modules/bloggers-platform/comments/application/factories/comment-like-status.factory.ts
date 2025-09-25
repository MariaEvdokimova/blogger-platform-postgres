import { Injectable } from "@nestjs/common";
import { CreateCommentLikeStatusDomainDto } from "../../domain/dto/create-comment-like-status.domain.dto";
import { CommentLike } from "../../domain/comment-like.entity";

@Injectable()
export class CommentLikeStatusFactory {
  constructor(
  ) {}
  async create(dto: CreateCommentLikeStatusDomainDto): Promise<CommentLike> {
    return CommentLike.createInstance({
      commentId: dto.commentId,
      userId: dto.userId,
      status: dto.status
    });
  }
}

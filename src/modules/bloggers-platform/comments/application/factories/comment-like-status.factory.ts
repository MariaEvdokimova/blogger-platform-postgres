import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { LikeComment, LikeCommentDocument, LikeCommentModelType } from "../../domain/likes.entity";
import { CreateCommentLikeStatusDomainDto } from "../../domain/dto/create-comment-like-status.domain.dto";

@Injectable()
export class CommentLikeStatusFactory {
  constructor(
    @InjectModel(LikeComment.name)
    private CommentLikesModel: LikeCommentModelType,
  ) {}
  async create(dto: CreateCommentLikeStatusDomainDto): Promise<LikeCommentDocument> {
     return this.CommentLikesModel.createInstance({
      commentId: dto.commentId,
      userId: dto.userId,
      status: dto.status,
    });
  }
}

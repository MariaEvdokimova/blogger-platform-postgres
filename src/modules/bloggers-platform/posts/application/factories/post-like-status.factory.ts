import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { LikePost, LikePostDocument, LikePostModelType } from "../../domain/likes.entity";
import { CreatePostLikeStatusDomainDto } from "../../domain/dto/create-post-like-status.domain.dto";

@Injectable()
export class PostLikeStatusFactory {
  constructor(
    @InjectModel(LikePost.name)
    private PostLikesModel: LikePostModelType,
  ) {}
  async create(dto: CreatePostLikeStatusDomainDto): Promise<LikePostDocument> {
     return this.PostLikesModel.createInstance({
      postId: dto.postId,
      userId: dto.userId,
      status: dto.status,
    });
  }
}

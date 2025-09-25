import { Injectable } from "@nestjs/common";
import { CreatePostLikeStatusDomainDto } from "../../domain/dto/create-post-like-status.domain.dto";
import { PostLike } from "../../domain/likes.entity";

@Injectable()
export class PostLikeStatusFactory {
  constructor(
  ) {}
  async create(dto: CreatePostLikeStatusDomainDto): Promise<PostLike> {
    return PostLike.createInstance({
      postId: dto.postId,
      userId: dto.userId,
      status: dto.status
    });
  }
}

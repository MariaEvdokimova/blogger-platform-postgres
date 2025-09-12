import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CommentInputDto } from "../../api/input-dto/comment.input-dto";
import { PostViewDto } from "../../../../bloggers-platform/posts/api/view-dto/posts.view-dto";
import { Comment, CommentDocument, CommentModelType } from "../../domain/comment.entity";
import { UserDocument } from "../../../../user-accounts/domain/user.entity";

@Injectable()
export class CommentFactory {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}
  async create(dto: CommentInputDto, post: PostViewDto, user: UserDocument): Promise<CommentDocument> {
    return this.CommentModel.createInstance({
      content: dto.content,
      userId: user._id,
      userLogin: user.login,
      postId: post.id,
    });
  }
}

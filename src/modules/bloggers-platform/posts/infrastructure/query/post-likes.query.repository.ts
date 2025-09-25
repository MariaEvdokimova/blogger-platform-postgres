import { Inject, Injectable } from "@nestjs/common";
import { Pool } from 'pg';

@Injectable()
export class PostsLikesQueryRepository {
  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  // async findStatusByUserIdAndPostId( userId: string, postId: string): Promise<LikeStatus | null> {
  
  //   const result = await this.LikePostModel.findOne({ 
  //     userId: new Types.ObjectId(userId), 
  //     postId: new Types.ObjectId(postId) 
  //   });
  //   return result ? result.status : null
  // }

  // async findByPostIds(postIds: string[], userId: string): Promise<LikePostDocument[]>{
  //   return this.LikePostModel.find({
  //     postId: { $in: postIds.map(id => new Types.ObjectId(id)) },
  //     userId: new Types.ObjectId(userId)
  //   }).exec();
  // }
}

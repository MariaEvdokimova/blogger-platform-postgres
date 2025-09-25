import { Inject, Injectable } from "@nestjs/common";
import { Pool } from 'pg';
import { PostLike } from "../domain/likes.entity";

@Injectable()
export class PostLikesRepository {

  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  async save(dto: PostLike): Promise<number> {
    if ( dto.id ) {
      const result = await this.db.query(
        `
        UPDATE public."postLikes"
        SET 
          status=$1::"postLikeStatus", 
          "postId"=$2, 
          "userId"=$3, 
          "deletedAt"=$4,
          "updatedAt"=CURRENT_TIMESTAMP
        WHERE id=$5
        RETURNING id; `,
        [
          dto.status,
          dto.postId,
          dto.userId,
          dto.deletedAt,
          dto.id
        ]
      );
      return result.rows[0]?.id;
    } 
    const result = await this.db.query(
      `
      INSERT INTO public."postLikes" (
        status, "postId", "userId", "createdAt", "updatedAt" 
      )
        VALUES( $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id;
      `,
      [
        dto.status,
        dto.postId,
        dto.userId,
      ]
    );
    return result.rows[0]?.id;
  }

  async findUserPostStatus( postId: number, userId: number ): Promise<PostLike | null> {
    const result = await this.db.query(
      `
      SELECT id, status, "postId", "userId", "createdAt", "updatedAt", "deletedAt"
      FROM 
        public."postLikes"
      WHERE 
        "postId" = $1
        AND "userId" = $2;
      `,
      [ postId, userId ]
    );
  
    const row = result.rows[0];
    if (!row) return null;

      const postLike = new PostLike(
        row.postId,
        row.userId,
        row.status
      );

      postLike.id = row.id;
      postLike.createdAt = row.createdAt;
      postLike.updatedAt = row.updatedAt;
      postLike.deletedAt = row.deletedAt;

    return postLike;
  }
  
  // async findLastThreeLikes ( postId: string): Promise<LikePostDocument[]> {
  //   return this.LikePostModel.find({
  //     postId: new Types.ObjectId(postId),
  //     status: LikeStatus.Like
  //   })
  //   .sort({ createdAt: -1 })
  //   .limit(3)
  // }
}

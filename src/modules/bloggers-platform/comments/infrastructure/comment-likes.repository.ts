import { Inject, Injectable } from "@nestjs/common";
import { Pool } from 'pg';
import { CommentLike } from "../domain/comment-like.entity";

@Injectable()
export class CommentLikesRepository {

  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  async save(dto: CommentLike): Promise<number> {
    if ( dto.id ) {
      const result = await this.db.query(
        `
        UPDATE public."commentLikes"
        SET 
          status=$1::"commentLikeStatus", 
          "commentId"=$2, 
          "userId"=$3, 
          "deletedAt"=$4,
          "updatedAt"=CURRENT_TIMESTAMP
        WHERE id=$5
        RETURNING id; `,
        [
          dto.status,
          dto.commentId,
          dto.userId,
          dto.deletedAt,
          dto.id
        ]
      );
      return result.rows[0]?.id;
    } 
    const result = await this.db.query(
      `
      INSERT INTO public."commentLikes" (
        status, "commentId", "userId", "createdAt", "updatedAt" 
      )
        VALUES( $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id;
      `,
      [
        dto.status,
        dto.commentId,
        dto.userId,
      ]
    );
    return result.rows[0]?.id;
  }

  async findUserCommentStatus( commentId: number, userId: number ): Promise<CommentLike | null> {
    const result = await this.db.query(
      `
      SELECT id, status, "commentId", "userId", "createdAt", "updatedAt", "deletedAt"
      FROM 
        public."commentLikes"
      WHERE 
        "commentId" = $1
        AND "userId" = $2;
      `,
      [ commentId, userId ]
    );

    const row = result.rows[0];
    if (!row) return null;

    const commentLike = new CommentLike(
      row.commentId,
      row.userId,
      row.status
    );

    commentLike.id = row.id;
    commentLike.createdAt = row.createdAt;
    commentLike.updatedAt = row.updatedAt;
    commentLike.deletedAt = row.deletedAt;

  return commentLike;
  }
}

import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Pool } from 'pg';
import { Comment } from "../domain/comment.entity";
import { DomainException } from "src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";

@Injectable()
export class CommentsRepository {

  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  async save(dto: Comment): Promise<number> {
    if ( dto.id ) {
      const result = await this.db.query(
        `
        UPDATE public."comments"
        SET 
          "content"=$1, 
          "postId"=$2, 
          "userId"=$3,
          "deletedAt"=$4,
          "updatedAt"=CURRENT_TIMESTAMP
        WHERE id=$5
        RETURNING id; `,
        [
          dto.content,
          dto.postId,
          dto.userId,
          dto.deletedAt,
          dto.id
        ]
      );
      return result.rows[0].id;
    } 
    const result = await this.db.query(
      `
      INSERT INTO public."comments" (
        "content", "postId", "userId", "createdAt", "updatedAt"    
      )
        VALUES( $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id;
      `,
      [
        dto.content,
        dto.postId,
        dto.userId,
      ]
    );
    return result.rows[0].id;
  }

  async findById(id: number): Promise<Comment> {
    const result = await this.db.query(
      `
      SELECT 
        id, "content", "postId", "userId", "createdAt", "updatedAt", "deletedAt"
      FROM 
        public.comments
      WHERE id = $1 AND "deletedAt" IS NULL;`,
      [ id ]
    );

    return result.rows[0];
  }

  async findOrNotFoundFail(id: number): Promise<Comment> {
    const result = await this.db.query(
      `
      SELECT 
        id, "content", "postId", "userId", "createdAt", "updatedAt", "deletedAt"
      FROM 
        public.comments
      WHERE id = $1 AND "deletedAt" IS NULL;`,
      [ id ]
    );
    console.log('result.rows ', result.rows)
    if (!result || result.rows.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not found',
      });      
    }

    return result.rows[0];
  }

  async verifyUserOwnership ( commentId: number, userId: number): Promise<Comment | null>  {
    const result = await this.db.query(
      `
      SELECT 
        id, "content", "postId", "userId", "createdAt", "updatedAt", "deletedAt"
      FROM 
        public.comments
      WHERE 
        id = $1 
        AND "userId" = $2
        AND "deletedAt" IS NULL;
      `,
      [ commentId, userId ]
    );

    const row = result.rows[0];
    if (!row) return null;

    const comment = new Comment(
      row.content,
      row.postId,
      row.userId
    );

    comment.id = row.id;
    comment.createdAt = row.createdAt;
    comment.updatedAt = row.updatedAt;
    comment.deletedAt = row.deletedAt;

    return comment;
  }
}

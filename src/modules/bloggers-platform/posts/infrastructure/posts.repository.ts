import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Pool } from 'pg';
import { Post } from "../domain/post.entity";
import { DomainException } from "src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";

@Injectable()
export class PostsRepository {

  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  async save(dto: Post): Promise<number> {
    if ( dto.id ) {
      const result = await this.db.query(
        `
        UPDATE public."posts"
        SET 
          title=$1, 
          "shortDescription"=$2, 
          "content"=$3, 
          "blogId"=$4, 
          "deletedAt"=$5,
          "updatedAt"=CURRENT_TIMESTAMP
        WHERE id=$6
        RETURNING id; `,
        [
          dto.title,
          dto.shortDescription,
          dto.content,
          dto.blogId,
          dto.deletedAt,
          dto.id
        ]
      );
      return result.rows[0].id;
    } 
    const result = await this.db.query(
      `
      INSERT INTO public."posts" (
        title, "shortDescription", "content", "blogId", "createdAt", "updatedAt"     
      )
        VALUES( $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id;
      `,
      [
        dto.title,
        dto.shortDescription,
        dto.content,
        dto.blogId,
      ]
    );
    return result.rows[0].id;
  }

   async findById(id: number): Promise<Post> {
    const result = await this.db.query(
      `
      SELECT 
        id, title, "shortDescription", "content", "blogId", "createdAt", "updatedAt", "deletedAt"
      FROM 
        public.posts
      WHERE id = $1 AND "deletedAt" IS NULL;`,
      [ id ]
    );

    if (!result || result.rows.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not fouund',
      }); 
    }

    return result.rows[0];
  }

  async findOrNotFoundFail(id: number): Promise<Post> {
    const result = await this.db.query(
      `
      SELECT 
        id, title, "shortDescription", "content", "blogId", "createdAt", "updatedAt", "deletedAt"
      FROM 
        public.posts
      WHERE id = $1 AND "deletedAt" IS NULL;`,
      [ id ]
    );

    if (!result || result.rows.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not fouund',
      }); 
    }

    const row = result.rows[0];
    const post = new Post(
      row.title,
      row.shortDescription,
      row.content,
      row.blogId
    );

    post.id = row.id;
    post.createdAt = row.createdAt;
    post.updatedAt = row.updatedAt;
    post.deletedAt = row.deletedAt;

    return post;
  }
}

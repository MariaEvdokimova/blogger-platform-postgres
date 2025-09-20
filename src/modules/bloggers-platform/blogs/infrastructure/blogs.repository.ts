import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Pool } from 'pg';
import { Blog } from "../domain/blog.entity";

@Injectable()
export class BlogsRepository {

  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  async save(dto: Blog): Promise<number> {
    if ( dto.id ) {
      const result = await this.db.query(
        `
        UPDATE public."blogs"
        SET 
          "name"=$1, 
          description=$2, 
          "websiteUrl"=$3, 
          "isMembership"=$4, 
          "deletedAt"=$5,
          "updatedAt"=CURRENT_TIMESTAMP
        WHERE id=$6
        RETURNING id; `,
        [
          dto.name,
          dto.description,
          dto.websiteUrl,
          dto.isMembership,
          dto.deletedAt,
          dto.id
        ]
      );
      return result.rows[0].id;
    } 
    const result = await this.db.query(
      `
      INSERT INTO public."blogs" (
        "name", description, "websiteUrl", "isMembership", "createdAt", "updatedAt"        
      )
        VALUES( $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id;
      `,
      [
        dto.name,
        dto.description,
        dto.websiteUrl,
        dto.isMembership,
      ]
    );
    return result.rows[0].id;
  }

  async findOrNotFoundFail(id: number): Promise<Blog> {
    const result = await this.db.query(
      `
      SELECT 
        id, "name", description, "websiteUrl", "isMembership", "createdAt", "updatedAt", "deletedAt"
      FROM 
        public.blogs
      WHERE id = $1 AND "deletedAt" IS NULL;`,
      [ id ]
    );

    if (!result || result.rows.length === 0) {
      throw new NotFoundException('blog not found');
    }

    const row = result.rows[0];
    const blog = new Blog(
      row.name,
      row.description,
      row.websiteUrl,
      row.isMembership
    );

    blog.id = row.id;
    blog.createdAt = row.createdAt;
    blog.updatedAt = row.updatedAt;
    blog.deletedAt = row.deletedAt;

    return blog;
  }
}

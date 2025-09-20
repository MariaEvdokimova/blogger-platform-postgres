import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Pool } from 'pg';
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { GetPostsQueryParams } from "../../api/input-dto/get-posts-query-params.input-dto";
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  async getByIdOrNotFoundFail(id: number): Promise<PostViewDto> {
    const result = await this.db.query(
      `
      SELECT 
        p.id, p.title, p."shortDescription", p."content", p."blogId", p."createdAt", b."name" AS "blogName"
      FROM 
        public.posts p
        LEFT JOIN public.blogs b ON p."blogId" = b.id
      WHERE p.id = $1 AND p."deletedAt" IS NULL;`,
      [ id ]
    );

    if (!result || result.rows.length === 0) {
      throw new NotFoundException('user not found');
    }

    return PostViewDto.mapToView(result.rows[0]);
  }

  async getPostsInBlog( query: GetPostsQueryParams, blogId: number ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await this.db.query(
      ` 
      SELECT 
        p.id, p.title, p."shortDescription", p."content", p."blogId", p."createdAt", b."name" AS "blogName"
      FROM 
        public.posts p
        LEFT JOIN public.blogs b ON p."blogId" = b.id
      WHERE 
        p."deletedAt" IS NULL
        AND p."blogId"=$1
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $2 OFFSET $3;`,
      [
        blogId,
        query.pageSize,
        query.calculateSkip()
      ]
    );
  
    const totalCount = await this.db.query(
      ` 
      SELECT count(*)
      FROM public.posts
      WHERE 
        "deletedAt" IS NULL
        AND "blogId"=$1;`,
      [
        blogId
      ]
    );

    const posts = result.rows || [];
    const items = posts.map(PostViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount: parseInt(totalCount.rows[0].count, 10) || 0,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getAll(
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await this.db.query(
      ` 
      SELECT 
        p.id, p.title, p."shortDescription", p."content", p."blogId", p."createdAt", b."name" AS "blogName"
      FROM 
        public.posts p
        LEFT JOIN public.blogs b ON p."blogId" = b.id
      WHERE 
        p."deletedAt" IS NULL
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $1 OFFSET $2;`,
      [
        query.pageSize,
        query.calculateSkip()
      ]
    );
  
    const totalCount = await this.db.query(
      ` 
      SELECT count(*)
      FROM public.posts
      WHERE 
        "deletedAt" IS NULL;`
    );

    const posts = result.rows || [];
    const items = posts.map(PostViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount: parseInt(totalCount.rows[0].count, 10) || 0,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}

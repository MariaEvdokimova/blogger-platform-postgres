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

  async getByIdOrNotFoundFail(id: number ): Promise<PostViewDto> {
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

  async getPostsInBlog( query: GetPostsQueryParams, blogId: number, userId?: number ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const likeStatusQuery = userId
    ? `
      SELECT
        "postId",
        COUNT(*) FILTER (WHERE status = 'Like') AS "likesCount",
        COUNT(*) FILTER (WHERE status = 'Dislike') AS "dislikesCount",
        COALESCE(
          MAX(status) FILTER (WHERE "userId" = $4),
          'None'
        ) AS "myStatus"
      FROM public."postLikes"
      WHERE "postId" in (SELECT id FROM "postsList")
      GROUP BY "postId"
    `
    : `
      SELECT
        "postId",
        COUNT(*) FILTER (WHERE status = 'Like') AS "likesCount",
        COUNT(*) FILTER (WHERE status = 'Dislike') AS "dislikesCount",
        'None' AS "myStatus"
      FROM public."postLikes"
      WHERE "postId" in (SELECT id FROM "postsList")
      GROUP BY "postId"
    `;

    const sql = 
      ` 
      WITH "postsList" AS (
        SELECT 
          p.id, p.title, p."shortDescription", p."content", p."blogId", p."createdAt", b."name" AS "blogName"
        FROM 
          public.posts p
          LEFT JOIN public.blogs b ON p."blogId" = b.id
        WHERE 
          p."deletedAt" IS null
          AND p."blogId"=$1
        ORDER BY p."${sortBy}" ${sortDirection}
        LIMIT $2 OFFSET $3
      ),
      "newestLikesList" AS (
        SELECT 
          sub."postId",
          COALESCE(
            JSONB_AGG(
              JSON_BUILD_OBJECT('userId', sub."userId", 'login', sub.login, 'addedAt', sub."createdAt")
              ORDER BY sub."createdAt" DESC
            ),
            '[]'::jsonb
          ) AS "newestLikes"
        FROM (
          SELECT 
            pl."postId",
            pl."userId",
            pl."createdAt",
            u.login,
            ROW_NUMBER() OVER (PARTITION BY pl."postId" ORDER BY pl."createdAt" DESC) as row_num
          FROM public."postLikes" pl
          LEFT JOIN public."users" u ON pl."userId" = u.id
          WHERE pl."postId" in (SELECT id FROM "postsList") AND pl.status = 'Like'
        ) sub
        WHERE sub.row_num <= 3
        GROUP BY sub."postId"
      )
	    SELECT 
        p.id, p.title, p."shortDescription", p."content", p."blogId", p."createdAt", p."blogName",
        pl."likesCount", 
        pl."dislikesCount",
        pl."myStatus",
        nl."newestLikes"
      FROM 
        "postsList" p
      LEFT JOIN "newestLikesList" nl on nl."postId" = p.id  
      LEFT JOIN (
        ${likeStatusQuery}
      ) pl ON pl."postId" = p.id
      ORDER BY p."${sortBy}" ${sortDirection};`;

    const values = userId
      ? [blogId, query.pageSize, query.calculateSkip(), userId]
      : [blogId, query.pageSize, query.calculateSkip()];

    const result = await this.db.query(sql, values);
  
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

  async getFullInfoByIdOrNotFoundFail(id: number, userId: number ): Promise<PostViewDto> {
    const result = await this.db.query(
      `
      WITH "newestLikesList" AS (
		    SELECT 
          sub."postId",
          COALESCE(
            JSONB_AGG(
              JSON_BUILD_OBJECT('userId', sub."userId"::text, 'login', sub.login, 'addedAt', sub."createdAt")
              ORDER BY sub."createdAt" DESC
            ),
            '[]'::jsonb
          ) AS "newestLikes"
        FROM (
          SELECT 
            pl."postId",
            pl."userId",
            pl."createdAt",
            u.login
          FROM public."postLikes" pl
          LEFT JOIN public."users" u ON pl."userId" = u.id
          WHERE pl."postId" = $1 AND pl.status = 'Like'
          ORDER BY pl."createdAt" DESC
          LIMIT 3
        ) sub
        GROUP BY sub."postId"
      )
      SELECT 
        p.id, p.title, p."shortDescription", p."content", p."blogId", p."createdAt", 
        b."name" AS "blogName",
        pl."likesCount", pl."dislikesCount", pl."myStatus",
        nl."newestLikes"
      FROM 
        public.posts p
        LEFT JOIN public.blogs b ON p."blogId" = b.id
	      LEFT JOIN "newestLikesList" nl on nl."postId" = p.id         
        LEFT JOIN (
        SELECT
          "postId",
          COUNT(*) FILTER (WHERE status = 'Like') AS "likesCount",
          COUNT(*) FILTER (WHERE status = 'Dislike') AS "dislikesCount",
          COALESCE(
            MAX(status) FILTER (WHERE "userId" = $2),
            'None'
          ) AS "myStatus"
        FROM public."postLikes"
        WHERE "postId"=$1
        GROUP BY "postId"
      ) pl ON pl."postId" = p.id            
      WHERE p.id = $1 AND p."deletedAt" IS NULL;`,
      [ id, userId ]
    );

    if (!result || result.rows.length === 0) {
      throw new NotFoundException('user not found');
    }

    return PostViewDto.mapToView(result.rows[0]);
  }

  async getAll(
    query: GetPostsQueryParams,
    userId: number
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await this.db.query(
      ` 
      WITH "postsList" AS (
        SELECT 
          p.id, p.title, p."shortDescription", p."content", p."blogId", p."createdAt", b."name" AS "blogName"
        FROM 
          public.posts p
          LEFT JOIN public.blogs b ON p."blogId" = b.id
        WHERE 
          p."deletedAt" IS NULL
        ORDER BY p."${sortBy}" ${sortDirection}
        LIMIT $1 OFFSET $2
      ),
      "newestLikesList" AS (
        SELECT 
          sub."postId",
          COALESCE(
            JSONB_AGG(
              JSON_BUILD_OBJECT('userId', sub."userId", 'login', sub.login, 'addedAt', sub."createdAt")
              ORDER BY sub."createdAt" DESC
            ),
            '[]'::jsonb
          ) AS "newestLikes"
        FROM (
          SELECT 
            pl."postId",
            pl."userId",
            pl."createdAt",
            u.login,
            ROW_NUMBER() OVER (PARTITION BY pl."postId" ORDER BY pl."createdAt" DESC) as row_num
          FROM public."postLikes" pl
          LEFT JOIN public."users" u ON pl."userId" = u.id
          WHERE pl."postId" in (SELECT id FROM "postsList") AND pl.status = 'Like'
        ) sub
        WHERE sub.row_num <= 3
        GROUP BY sub."postId"
      )
	    SELECT 
        p.id, p.title, p."shortDescription", p."content", p."blogId", p."createdAt", p."blogName",
        pl."likesCount", 
        pl."dislikesCount",
        pl."myStatus",
        nl."newestLikes"
      FROM 
        "postsList" p
      LEFT JOIN "newestLikesList" nl on nl."postId" = p.id  
      LEFT JOIN (
        SELECT
          "postId",
          COUNT(*) FILTER (WHERE status = 'Like') AS "likesCount",
          COUNT(*) FILTER (WHERE status = 'Dislike') AS "dislikesCount",
          COALESCE(
            MAX(status) FILTER (WHERE "userId" = $3),
            'None'
          ) AS "myStatus"
        FROM public."postLikes"
        WHERE "postId" in (select distinct id from "postsList")
        GROUP BY "postId"
      ) pl ON pl."postId" = p.id
      ORDER BY p."${sortBy}" ${sortDirection};`,
      [
        query.pageSize,
        query.calculateSkip(),
        userId
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

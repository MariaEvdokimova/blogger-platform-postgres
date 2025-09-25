import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Pool } from 'pg';
import { CommentViewDto } from "../../api/view-dto/comments.view-dto";
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetCommentsQueryParams } from "../../api/input-dto/get-comments-query-params.input-dto";


@Injectable()
export class CommentsQueryRepository {
  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  async getFullInfoByIdOrNotFoundFail(commentId: number, userId: number): Promise<CommentViewDto> {
    const result = await this.db.query(
      `
      SELECT 
        c.id, 
        c."content", 
        c."postId", 
        c."userId", 
        c."createdAt", 
        c."updatedAt", 
        c."deletedAt", 
        u.login AS "userLogin", 
        cl."likesCount", 
        cl."dislikesCount",
        cl."myStatus"
      FROM public."comments" c
      LEFT JOIN public."users" u ON c."userId"  = u.id
      LEFT JOIN (
        SELECT
          "commentId",
          COUNT(*) FILTER (WHERE status = 'Like') AS "likesCount",
          COUNT(*) FILTER (WHERE status = 'Dislike') AS "dislikesCount",
          COALESCE(
            MAX(status) FILTER (WHERE "userId" = $2),
            'None'
          ) AS "myStatus"
        FROM public."commentLikes"
        WHERE "commentId"=$1
        GROUP BY "commentId"
      ) cl ON cl."commentId" = c.id
      WHERE 
        c.id = $1 
        AND c."deletedAt" IS NULL;`,
      [ commentId, userId ]
    );
    
    if (!result || result.rows.length === 0) {
      throw new NotFoundException('comment not found');
    }

    const comment = result.rows[0];    
    return CommentViewDto.mapToView({
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      userLogin: comment.userLogin,
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      myStatus: comment.myStatus,
      createdAt: comment.createdAt
    });
  }

  async getCommentsInPost(
    query: GetCommentsQueryParams, 
    postId: number, 
    userId: number 
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const sql = 
      ` 
      WITH "commentsList" AS (
      SELECT 
        c.id, 
        c."content", 
        c."postId", 
        c."userId", 
        c."createdAt", 
        c."updatedAt", 
        c."deletedAt", 
        u.login AS "userLogin" 
      FROM public."comments" c
      LEFT JOIN public."users" u ON c."userId"  = u.id
      WHERE 
        c."postId" = $1 
        AND c."deletedAt" IS NULL
	    ORDER BY c."${sortBy}" ${sortDirection}
      LIMIT $2 OFFSET $3
      )
      SELECT 
        c.id, 
        c."content", 
        c."postId", 
        c."userId", 
        c."createdAt", 
        c."updatedAt", 
        c."deletedAt", 
        c."userLogin", 
        cl."likesCount", 
        cl."dislikesCount",
        cl."myStatus"
      FROM "commentsList" c
      LEFT JOIN (
        SELECT
          "commentId",
          COUNT(*) FILTER (WHERE status = 'Like') AS "likesCount",
          COUNT(*) FILTER (WHERE status = 'Dislike') AS "dislikesCount",
          COALESCE(
            MAX(status) FILTER (WHERE "userId" = $4),
            'None'
          ) AS "myStatus"
        FROM public."commentLikes"
        WHERE "commentId" in (select distinct id from "commentsList")
        GROUP BY "commentId"
      ) cl ON cl."commentId" = c.id
       ORDER BY c."${sortBy}" ${sortDirection}
      `;
    
    const result = await this.db.query(sql, [
        postId,
        query.pageSize,
        query.calculateSkip(),
        userId
      ]
    );
  
    const totalCount = await this.db.query(
      ` 
        SELECT count(*)
        FROM public."comments" c
        WHERE 
          c."postId" = $1 
          AND "deletedAt" IS NULL;
      `,
      [ postId ]
    );

    const comments = result.rows || [];
    const items = comments.map(CommentViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount: parseInt(totalCount.rows[0].count, 10) || 0,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}

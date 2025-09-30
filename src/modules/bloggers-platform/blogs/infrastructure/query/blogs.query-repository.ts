import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Pool } from 'pg';
import { BlogViewDto } from "../../api/view-dto/blogs.view-dto";
import { GetBlogsQueryParams } from "../../api/input-dto/get-blogs-query-params.input-dto";
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { Blog } from "../../domain/blog.entity";
import { DomainException } from "src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  async getByIdOrNotFoundFail(id: number): Promise<Blog> {
    const result = await this.db.query(
          `
          SELECT 
            id, 
            "name", 
            description, 
            "websiteUrl", 
            "isMembership", 
            "createdAt"
          FROM 
            public.blogs
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

  async getToViewByIdOrNotFoundFail(id: number): Promise<BlogViewDto> {
    const result = await this.db.query(
          `
          SELECT 
            id, 
            "name", 
            description, 
            "websiteUrl", 
            "isMembership", 
            "createdAt"
          FROM 
            public.blogs
          WHERE id = $1 AND "deletedAt" IS NULL;`,
          [ id ]
        );
    
        if (!result || result.rows.length === 0) {
          throw new DomainException({
            code: DomainExceptionCode.NotFound,
            message: 'not fouund',
           }); 
        }
    
    return BlogViewDto.mapToView(result.rows[0]);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const whereClauses: string[] = ['"deletedAt" IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    if (query.searchNameTerm) {
      whereClauses.push(`name ILIKE $${paramIndex++}`);
      params.push(`%${query.searchNameTerm}%`);
    }

    params.push(query.pageSize);
    params.push(query.calculateSkip());

    const whereSql = whereClauses.join(' AND ');

    const result = await this.db.query(
      ` 
      SELECT 
        id, 
        "name", 
        description, 
        "websiteUrl", 
        "isMembership", 
        "createdAt"
      FROM 
        public.blogs
      WHERE 
        ${whereSql}
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $${paramIndex++} OFFSET $${paramIndex};`,
      params
    );
  
    const totalCount = await this.db.query(
      ` 
      SELECT count(*)
      FROM public.blogs
      WHERE 
        ${whereSql};`,
      params.slice(0, paramIndex - 2) // Убираем LIMIT и OFFSET параметры
    );

    const blogs = result.rows || [];
    const items = blogs.map(BlogViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount: parseInt(totalCount.rows[0].count, 10) || 0,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}

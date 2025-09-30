import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Pool } from 'pg';
import { UserViewDto } from "../../api/view-dto/users.view-dto";
import { GetUsersQueryParams } from "../../api/input-dto/get-users-query-params.input-dto";
import { PaginatedViewDto } from "../../../../core/dto/base.paginated.view-dto";
import { DomainException } from "src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";

@Injectable()
export class UsersQueryRepository {
  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const result = await this.db.query(
      `
      SELECT 
        id, login, email, "createdAt"
      FROM 
        public.users
      WHERE id = $1 AND "deletedAt" IS NULL;`,
      [ id ]
    );

    if (!result || result.rows.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not fouund',
      }); 
    }

    return UserViewDto.mapToView(result.rows[0]);
  }

  async findById( id: string ): Promise<UserViewDto | null> {
     const result = await this.db.query(
      `
      SELECT 
        id, login, email, "createdAt"
      FROM 
        public.users
      WHERE id = $1 AND "deletedAt" IS NULL;`,
      [ id ]
    );

    return result.rows[0] ? UserViewDto.mapToView(result.rows[0]) : null;
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const whereClauses: string[] = ['"deletedAt" IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Поисковые условия с OR
    const searchConditions: string[] = [];

    if (query.searchLoginTerm) {
      searchConditions.push(`login ILIKE $${paramIndex}`);
      params.push(`%${query.searchLoginTerm}%`);
      paramIndex++;
    }

    if (query.searchEmailTerm) {
      searchConditions.push(`email ILIKE $${paramIndex}`);
      params.push(`%${query.searchEmailTerm}%`);
      paramIndex++;
    }

    if (searchConditions.length > 0) {
      whereClauses.push(`(${searchConditions.join(' OR ')})`);
    }

    params.push(query.pageSize);
    params.push(query.calculateSkip());

    const whereSql = whereClauses.join(' AND ');

    const result = await this.db.query(
      ` 
      SELECT 
        id, login, email, "createdAt"
      FROM 
        public.users
      WHERE 
        ${whereSql}
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $${paramIndex++} OFFSET $${paramIndex};`,
      params
    );
  
    const totalCount = await this.db.query(
      ` 
      SELECT count(*)
      FROM public.users
      WHERE 
        ${whereSql};`,
      params.slice(0, paramIndex - 2) // Убираем LIMIT и OFFSET параметры
    );

    const users = result.rows || [];
    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount: parseInt(totalCount.rows[0].count, 10) || 0,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}

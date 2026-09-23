import { type Paginated, type PaginationQuery } from '@repo/api/pagination';
import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

interface PaginateOptions {
  searchColumns?: string[];
  sortColumn?: string;
}

export const paginate = async <T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  { page, limit, sortOrder, search }: PaginationQuery,
  { searchColumns = [], sortColumn = 'created_at' }: PaginateOptions = {},
): Promise<Paginated<T>> => {
  const { alias } = queryBuilder;

  if (search && searchColumns.length > 0) {
    const escapedSearch = search.replace(/[%_\\]/g, '\\$&');
    const conditions = searchColumns
      .map((column) => `${alias}.${column} ILIKE :search`)
      .join(' OR ');
    queryBuilder.andWhere(`(${conditions})`, { search: `%${escapedSearch}%` });
  }

  queryBuilder
    .orderBy(`${alias}.${sortColumn}`, sortOrder)
    .addOrderBy(`${alias}.id`, 'ASC')
    .skip((page - 1) * limit)
    .take(limit);

  const [data, total] = await queryBuilder.getManyAndCount();

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

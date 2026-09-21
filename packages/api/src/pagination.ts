import { z } from 'zod';

export const SortOrder = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  sortOrder: z.enum([SortOrder.ASC, SortOrder.DESC]).default(SortOrder.DESC),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

const paginatedMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export interface Paginated<T> {
  data: T[];
  meta: z.infer<typeof paginatedMetaSchema>;
}

export const paginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    data: z.array(item),
    meta: paginatedMetaSchema,
  });

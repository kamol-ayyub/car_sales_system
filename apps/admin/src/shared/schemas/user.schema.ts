import { paginatedSchema, type Paginated } from '@repo/api';
import { meResponseSchema, type MeResponse } from './auth.schema';

export const userListSchema = paginatedSchema(meResponseSchema);

export type PaginatedUsers = Paginated<MeResponse>;

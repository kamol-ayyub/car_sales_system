import { paginatedSchema, z } from '@repo/api';
import { meResponseSchema } from './auth.schema';

export const userListSchema = paginatedSchema(meResponseSchema);

export type User = z.infer<typeof meResponseSchema>;
export type PaginatedUsers = z.infer<typeof userListSchema>;

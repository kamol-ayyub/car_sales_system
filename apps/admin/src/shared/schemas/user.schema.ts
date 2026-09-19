import { z } from '@repo/api';
import { meResponseSchema } from './auth.schema';

export const userListSchema = z.array(meResponseSchema);

export type User = z.infer<typeof meResponseSchema>;

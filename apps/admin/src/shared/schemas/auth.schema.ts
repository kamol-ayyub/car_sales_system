import { z } from '@repo/api';
import { UserRole } from '@/shared/types/auth-types';

/**
 * Auth response schemas.
 * The app does not trust the backend: responses are validated against schemas.
 */

export const accessTokenResponseSchema = z.object({
  accessToken: z.string(),
});

export const signinResponseSchema = accessTokenResponseSchema;
export const refreshResponseSchema = accessTokenResponseSchema;

export const userRoleSchema = z.enum([
  UserRole.Owner,
  UserRole.SalesPerson,
  UserRole.Client,
] as const);

export const meResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable().optional(),
    roles: z.array(userRoleSchema),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .loose();

export type MeResponse = z.infer<typeof meResponseSchema>;

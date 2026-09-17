import { z } from '@repo/api';

/**
 * Auth response schemas.
 * The app does not trust the backend: responses are validated against schemas.
 */

export const signinResponseSchema = z
  .object({
    accessToken: z.string().nullable().optional(),
    refreshToken: z.string().nullable().optional(),
  })
  .loose();

export const refreshResponseSchema = z
  .object({
    accessToken: z.string().nullable().optional(),
    refreshToken: z.string().nullable().optional(),
  })
  .loose();

export const userRoleSchema = z.enum(['owner', 'sales_person', 'client']);

export const meResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().nullable().optional(),
    roles: z.array(userRoleSchema),
    tokenVersion: z.number().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .loose();

export type MeResponse = z.infer<typeof meResponseSchema>;

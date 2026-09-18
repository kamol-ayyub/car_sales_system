import { z } from '@repo/api';

/**
 * Auth response schemas.
 * The app does not trust the backend: responses are validated against schemas.
 */

export const accessTokenResponseSchema = z.object({
  accessToken: z.string(),
});

export const signinResponseSchema = accessTokenResponseSchema;
export const refreshResponseSchema = accessTokenResponseSchema;

export const userRoleSchema = z.enum(['owner', 'sales_person', 'client']);

export const meResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().nullable().optional(),
    roles: z.array(userRoleSchema),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .loose();

export type MeResponse = z.infer<typeof meResponseSchema>;

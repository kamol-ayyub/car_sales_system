import { z } from '@repo/api';

/**
 * Auth response schemas.
 * The app does not trust the backend: responses are validated against schemas.
 */

/** POST /auth/signin — only tokens are read from the body. */
export const signinResponseSchema = z
  .object({
    accessToken: z.string().nullable().optional(),
    refreshToken: z.string().nullable().optional(),
  })
  .passthrough();

/** POST /auth/refresh — only tokens are read from the body. */
export const refreshResponseSchema = z
  .object({
    accessToken: z.string().nullable().optional(),
    refreshToken: z.string().nullable().optional(),
  })
  .passthrough();

/** GET /me — only the fields actually consumed are validated. */
export const meResponseSchema = z
  .object({
    id: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    role: z.string().nullable().optional(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
  })
  .passthrough();

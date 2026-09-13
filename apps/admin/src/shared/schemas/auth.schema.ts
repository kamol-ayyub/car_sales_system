import { Joi } from "@repo/api";

/**
 * Auth response schemas.
 * The app does not trust the backend: responses are validated against schemas.
 */

/** POST /auth/signin — only tokens are read from the body. */
export const signinResponseSchema = Joi.object({
  accessToken: Joi.string().allow(null, "").optional(),
  refreshToken: Joi.string().allow(null, "").optional(),
}).unknown(true);

/** POST /auth/refresh — only tokens are read from the body. */
export const refreshResponseSchema = Joi.object({
  accessToken: Joi.string().allow(null, "").optional(),
  refreshToken: Joi.string().allow(null, "").optional(),
}).unknown(true);

/** GET /me — only the fields actually consumed are validated. */
export const meResponseSchema = Joi.object({
  id: Joi.string().allow(null, "").optional(),
  email: Joi.string().allow(null, "").optional(),
  role: Joi.string().allow(null, "").optional(),
  firstName: Joi.string().allow(null, "").optional(),
  lastName: Joi.string().allow(null, "").optional(),
}).unknown(true);

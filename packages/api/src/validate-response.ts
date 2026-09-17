import type { AxiosResponse } from 'axios';
import type { ZodType } from 'zod';

export type ValidatableSchema =
  | ZodType
  | {
      safeParse: (
        data: unknown,
      ) =>
        { success: true; data: unknown } | { success: false; error: unknown };
    };

/**
 * Validates an Axios response body against a Zod schema.
 * If validation fails, throws the error to be handled by React Query.
 */
export function validateResponse<T>(
  response: AxiosResponse<T>,
  schema?: ValidatableSchema,
  url?: string,
): AxiosResponse<T> {
  if (!schema) return response;

  const result = schema.safeParse(response.data);

  if (!result.success) {
    console.error('Response validation failed', url, result.error);
    throw result.error;
  }

  return { ...response, data: (result.data ?? response.data) as T };
}

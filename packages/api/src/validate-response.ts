import type { AxiosResponse } from "axios";

export interface ValidatableSchema {
  validate: (
    data: unknown,
    options?: Record<string, unknown>,
  ) => {
    value?: unknown;
    error?: unknown;
  };
}

/**
 * Validates an Axios response body against a Joi schema.
 * If validation fails, throws the error to be handled by React Query.
 */
export function validateResponse<T>(
  response: AxiosResponse<T>,
  schema?: ValidatableSchema,
  url?: string,
): AxiosResponse<T> {
  if (!schema) return response;

  const result = schema.validate(response.data, {
    abortEarly: false,
    stripUnknown: false,
  });

  if (result.error) {
    console.error("Response validation failed", url, result.error);
    throw result.error;
  }

  return { ...response, data: (result.value ?? response.data) as T };
}

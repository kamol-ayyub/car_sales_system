import { AxiosError } from 'axios';
import { apiErrorSchema } from '../schemas/api-error.schema';

const FALLBACK_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const parsed = apiErrorSchema.safeParse(error.response?.data);
    if (parsed.success) {
      return parsed.data.error.message;
    }
  }
  return FALLBACK_ERROR_MESSAGE;
};

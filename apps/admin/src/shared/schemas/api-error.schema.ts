import { z } from '@repo/api';

// Matches the server's GlobalExceptionFilter error envelope
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

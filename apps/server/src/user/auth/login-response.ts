import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export class LoginResponse extends createZodDto(loginResponseSchema) {}

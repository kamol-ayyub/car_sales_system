import { createZodDto } from 'nestjs-zod';
import { loginResponseSchema } from '@repo/api/login-response';

export class LoginResponse extends createZodDto(loginResponseSchema) {}

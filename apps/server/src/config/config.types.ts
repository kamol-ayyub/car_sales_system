import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { z } from 'zod';
import { AuthConfig } from './auth.config';

export interface ConfigType {
  database: TypeOrmModuleOptions;
  auth: AuthConfig;
}

export const appConfigSchema = z.object({
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_DATABASE: z.string().min(1),
  DB_SYNC: z.coerce.number().refine((val) => val === 0 || val === 1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1),
  JWT_ISSUER: z.string().default('car-sales-system'),
  JWT_AUDIENCE: z.string().default('car-sales-system'),
});

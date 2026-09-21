import { UserRole } from '@/user/entities/user.entity';
import { paginationQuerySchema } from '@repo/api/pagination';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const listUsersQuerySchema = paginationQuerySchema.extend({
  role: z.enum([UserRole.CLIENT, UserRole.SALES_PERSON]).optional(),
});

export class ListUsersQueryDto extends createZodDto(listUsersQuerySchema) {}

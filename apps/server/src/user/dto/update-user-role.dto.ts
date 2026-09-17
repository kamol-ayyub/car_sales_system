import { UserRole } from '@/user/entities/user.entity';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  roles: z.array(z.enum(UserRole)).min(1),
});

export class UpdateUserRoleDto extends createZodDto(updateUserRoleSchema) {}

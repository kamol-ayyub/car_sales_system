import { UserRole } from '@/user/entities/user.entity';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email().max(255),
  phone: z.string().max(20).optional(),
  password: z.string().min(8).max(72),
  roles: z.array(z.enum(UserRole)).optional(),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}

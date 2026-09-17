import { createZodDto } from 'nestjs-zod';
import { createUserSchema } from './create-user.dto';

export const updateUserSchema = createUserSchema
  .omit({ roles: true })
  .partial();

export class UpdateUserDto extends createZodDto(updateUserSchema) {}

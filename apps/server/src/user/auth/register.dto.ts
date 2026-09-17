import { createZodDto } from 'nestjs-zod';
import { createUserSchema } from '../dto/create-user.dto';

export const registerSchema = createUserSchema.pick({
  name: true,
  email: true,
  phone: true,
  password: true,
});

export class RegisterDto extends createZodDto(registerSchema) {}

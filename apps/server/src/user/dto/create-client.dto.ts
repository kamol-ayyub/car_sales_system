import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(20),
  email: z.email().trim().max(255).optional(),
});

export class CreateClientDto extends createZodDto(createClientSchema) {}

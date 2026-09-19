import { carStatusSchema } from '@repo/api/car-status';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createCarSchema = z.object({
  brand: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.coerce.number().int().min(1886).max(2100),
  price: z.coerce.number().min(0),
  vin: z.string().length(17),
  status: carStatusSchema.optional(),
  images: z.array(z.url()).max(8).optional(),
  salesPersonId: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export class CreateCarDto extends createZodDto(createCarSchema) {}

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const sellCarSchema = z.object({
  clientId: z.uuid(),
  salePrice: z.coerce.number().min(0).optional(),
});

export class SellCarDto extends createZodDto(sellCarSchema) {}

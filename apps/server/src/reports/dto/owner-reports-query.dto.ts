import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ownerReportsQuerySchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
});

export class OwnerReportsQueryDto extends createZodDto(
  ownerReportsQuerySchema,
) {}

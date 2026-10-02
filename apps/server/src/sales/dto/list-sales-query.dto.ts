import { paginationQuerySchema } from '@repo/api/pagination';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const listSalesQuerySchema = paginationQuerySchema.extend({
  salesPersonId: z.uuid().optional(),
});

export class ListSalesQueryDto extends createZodDto(listSalesQuerySchema) {}

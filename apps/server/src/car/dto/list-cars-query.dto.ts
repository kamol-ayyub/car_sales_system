import { CarStatus } from '@repo/api/car-status';
import { paginationQuerySchema } from '@repo/api/pagination';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const listCarsQuerySchema = paginationQuerySchema.extend({
  status: z.enum([CarStatus.AVAILABLE, CarStatus.SOLD]).optional(),
  salesPersonId: z.uuid().optional(),
});

export class ListCarsQueryDto extends createZodDto(listCarsQuerySchema) {}

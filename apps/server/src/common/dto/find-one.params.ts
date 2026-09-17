import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const findOneParamsSchema = z.object({
  id: z.uuid(),
});

export class FindOneParams extends createZodDto(findOneParamsSchema) {}

import { paginatedSchema, type Paginated, z } from '@repo/api';
import { carStatusSchema } from '@repo/api/car-status';

const carPartySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable().optional(),
  })
  .loose();

export const carSchema = z
  .object({
    id: z.string(),
    brand: z.string(),
    model: z.string(),
    year: z.coerce.number(),
    price: z.coerce.number(),
    salePrice: z.coerce.number().nullable().optional(),
    vin: z.string(),
    status: carStatusSchema,
    images: z.array(z.string()).optional(),
    salesPerson: carPartySchema.nullable().optional(),
    client: carPartySchema.nullable().optional(),
    soldAt: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .loose();

export const carListSchema = paginatedSchema(carSchema);

export type Car = z.infer<typeof carSchema>;
export type PaginatedCars = Paginated<Car>;

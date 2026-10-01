import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const dashboardPartySchema = z.object({
  id: z.string(),
  name: z.string(),
});

const recentSaleSchema = z.object({
  id: z.string(),
  brand: z.string(),
  model: z.string(),
  soldAt: z.string().nullable(),
  salePrice: z.number().nullable(),
  client: dashboardPartySchema.nullable(),
  salesPerson: dashboardPartySchema.nullable(),
});

export const ownerDashboardResponseSchema = z.object({
  revenue: z.number(),
  soldCarsCount: z.number(),
  availableCarsCount: z.number(),
  teamSize: z.number(),
  recentSales: z.array(recentSaleSchema),
  topBrands: z.array(
    z.object({
      brand: z.string(),
      count: z.number(),
    }),
  ),
});

export class OwnerDashboardResponse extends createZodDto(
  ownerDashboardResponseSchema,
) {}

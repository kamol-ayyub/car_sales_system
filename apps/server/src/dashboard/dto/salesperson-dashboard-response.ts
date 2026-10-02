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
});

const standingSchema = z.object({
  id: z.string(),
  name: z.string(),
  count: z.number(),
});

export const salespersonDashboardResponseSchema = z.object({
  mySalesCount: z.number(),
  myRevenue: z.number(),
  availableCarsCount: z.number(),
  recentSales: z.array(recentSaleSchema),
  standings: z.array(standingSchema),
});

export class SalespersonDashboardResponse extends createZodDto(
  salespersonDashboardResponseSchema,
) {}

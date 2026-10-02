import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const reportPartySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ownerReportsResponseSchema = z.object({
  summary: z.object({
    revenue: z.number(),
    unitsSold: z.number(),
    avgSalePrice: z.number(),
  }),
  revenueOverTime: z.array(
    z.object({
      period: z.string(),
      revenue: z.number(),
      units: z.number(),
    }),
  ),
  salespeople: z.array(
    z.object({
      salesPerson: reportPartySchema,
      units: z.number(),
      revenue: z.number(),
      avgSalePrice: z.number(),
    }),
  ),
  brands: z.array(
    z.object({
      brand: z.string(),
      units: z.number(),
      revenue: z.number(),
    }),
  ),
  topClients: z.array(
    z.object({
      client: reportPartySchema,
      purchases: z.number(),
      totalSpent: z.number(),
    }),
  ),
  groupBy: z.enum(['day', 'week', 'month']),
});

export class OwnerReportsResponse extends createZodDto(
  ownerReportsResponseSchema,
) {}

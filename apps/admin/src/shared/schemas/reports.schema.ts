import { z } from '@repo/api';

const reportPartySchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .loose();

export const ownerReportsSchema = z
  .object({
    summary: z
      .object({
        revenue: z.coerce.number(),
        unitsSold: z.coerce.number(),
        avgSalePrice: z.coerce.number(),
      })
      .loose(),
    revenueOverTime: z.array(
      z
        .object({
          period: z.string(),
          revenue: z.coerce.number(),
          units: z.coerce.number(),
        })
        .loose(),
    ),
    salespeople: z.array(
      z
        .object({
          salesPerson: reportPartySchema,
          units: z.coerce.number(),
          revenue: z.coerce.number(),
          avgSalePrice: z.coerce.number(),
        })
        .loose(),
    ),
    brands: z.array(
      z
        .object({
          brand: z.string(),
          units: z.coerce.number(),
          revenue: z.coerce.number(),
        })
        .loose(),
    ),
    topClients: z.array(
      z
        .object({
          client: reportPartySchema,
          purchases: z.coerce.number(),
          totalSpent: z.coerce.number(),
        })
        .loose(),
    ),
    groupBy: z.enum(['day', 'week', 'month']),
  })
  .loose();

export type OwnerReports = z.infer<typeof ownerReportsSchema>;
export type ReportGroupBy = OwnerReports['groupBy'];

import { z } from '@repo/api';

const dashboardPartySchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .loose();

const recentSaleSchema = z
  .object({
    id: z.string(),
    brand: z.string(),
    model: z.string(),
    soldAt: z.string().nullable().optional(),
    salePrice: z.coerce.number().nullable().optional(),
    client: dashboardPartySchema.nullable().optional(),
    salesPerson: dashboardPartySchema.nullable().optional(),
  })
  .loose();

export const ownerDashboardSchema = z
  .object({
    revenue: z.coerce.number(),
    soldCarsCount: z.coerce.number(),
    availableCarsCount: z.coerce.number(),
    teamSize: z.coerce.number(),
    recentSales: z.array(recentSaleSchema),
    topBrands: z.array(
      z
        .object({
          brand: z.string(),
          count: z.coerce.number(),
        })
        .loose(),
    ),
  })
  .loose();

export type OwnerDashboard = z.infer<typeof ownerDashboardSchema>;
export type RecentSale = z.infer<typeof recentSaleSchema>;

export const salespersonDashboardSchema = z
  .object({
    mySalesCount: z.coerce.number(),
    myRevenue: z.coerce.number(),
    availableCarsCount: z.coerce.number(),
    recentSales: z.array(recentSaleSchema),
    standings: z.array(
      z
        .object({
          id: z.string(),
          name: z.string(),
          count: z.coerce.number(),
        })
        .loose(),
    ),
  })
  .loose();

export type SalespersonDashboard = z.infer<typeof salespersonDashboardSchema>;

import { DataErrorState } from '@/shared/components/data-error-state';
import { Page } from '@/shared/components/page';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import {
  ownerDashboardSchema,
  type OwnerDashboard as OwnerDashboardStats,
} from '@/shared/schemas/dashboard.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
import { truncateLabel } from '@/shared/utils/truncate-label';
import { useGetAllQuery } from '@repo/api';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@repo/ui/components/chart';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@repo/ui/components/empty';
import { Link } from '@tanstack/react-router';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { MetricCard } from '@/shared/components/metric-card';
import { DashboardSkeleton } from './dashboard-skeleton';
import { RecentSalesTable } from './recent-sales-table';

const inventoryChartConfig = {
  count: {
    label: 'Available',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export const OwnerDashboard = () => {
  const {
    data: response,
    isPending,
    isError,
    refetch,
  } = useGetAllQuery<OwnerDashboardStats>({
    key: QUERY_KEYS.ownerDashboard,
    url: '/dashboard/owner',
    schema: ownerDashboardSchema,
  });

  if (isPending) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return <DataErrorState onRetry={refetch} />;
  }

  const dashboard = response?.data;
  if (!dashboard) {
    return <DashboardSkeleton />;
  }

  const {
    revenue,
    soldCarsCount,
    availableCarsCount,
    teamSize,
    recentSales,
    topBrands,
  } = dashboard;

  return (
    <Page
      title="Owner dashboard"
      description="Business overview across inventory and sales."
      actions={
        <Button variant="outline" render={<Link to="/inventory" />}>
          View inventory
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Revenue"
          value={formatCurrency(revenue)}
          hint={`${soldCarsCount} cars sold`}
        />
        <MetricCard
          title="Available stock"
          value={String(availableCarsCount)}
          hint="Ready to sell"
        />
        <MetricCard
          title="Cars sold"
          value={String(soldCarsCount)}
          hint="All time"
        />
        <MetricCard
          title="Team size"
          value={String(teamSize)}
          hint="Salespeople on staff"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentSalesTable cars={recentSales} />
        <Card>
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Available inventory by brand
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topBrands.length === 0 ? (
              <Empty className="p-6">
                <EmptyHeader>
                  <EmptyTitle className="text-sm font-medium">
                    No available cars
                  </EmptyTitle>
                  <EmptyDescription>
                    Available stock will be grouped by brand here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <p className="sr-only">
                  Horizontal bar chart of available inventory by brand, ranked
                  from most to least stock.
                </p>
                <ChartContainer
                  config={inventoryChartConfig}
                  className="aspect-auto h-[240px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={topBrands}
                    layout="vertical"
                    margin={{ left: 8, right: 12 }}
                  >
                    <CartesianGrid horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="brand"
                      tickLine={false}
                      axisLine={false}
                      width={88}
                      tickFormatter={truncateLabel}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Page>
  );
};

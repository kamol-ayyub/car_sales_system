import { DataErrorState } from '@/shared/components/data-error-state';
import { Page } from '@/shared/components/page';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import {
  ownerDashboardSchema,
  type OwnerDashboard as OwnerDashboardStats,
} from '@/shared/schemas/dashboard.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
import { useGetAllQuery } from '@repo/api';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@repo/ui/components/empty';
import { Link } from '@tanstack/react-router';
import { DashboardSkeleton } from './dashboard-skeleton';
import { MetricCard } from './metric-card';
import { RecentSalesTable } from './recent-sales-table';

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

  const topBrandCount = topBrands[0]?.count ?? 1;

  return (
    <Page
      title='Owner dashboard'
      description='Business overview across inventory and sales.'
      actions={
        <Button variant='outline' render={<Link to='/inventory' />}>
          View inventory
        </Button>
      }
    >
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <MetricCard
          title='Revenue'
          value={formatCurrency(revenue)}
          hint={`${soldCarsCount} cars sold`}
        />
        <MetricCard
          title='Available stock'
          value={String(availableCarsCount)}
          hint='Ready to sell'
        />
        <MetricCard
          title='Cars sold'
          value={String(soldCarsCount)}
          hint='All time'
        />
        <MetricCard
          title='Team size'
          value={String(teamSize)}
          hint='Salespeople on staff'
        />
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <RecentSalesTable cars={recentSales} />
        <Card>
          <CardHeader>
            <CardTitle>Available inventory by brand</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            {topBrands.length === 0 ? (
              <Empty className='p-6'>
                <EmptyHeader>
                  <EmptyTitle className='text-sm font-medium'>
                    No available cars
                  </EmptyTitle>
                  <EmptyDescription>
                    Available stock will be grouped by brand here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              topBrands.map(({ brand, count }) => (
                <div key={brand} className='flex items-center gap-3'>
                  <span className='w-24 truncate text-sm'>{brand}</span>
                  <div
                    role='progressbar'
                    aria-label={`${brand}: ${count} available`}
                    aria-valuenow={count}
                    aria-valuemin={0}
                    aria-valuemax={topBrandCount}
                    className='h-2 flex-1 overflow-hidden rounded-full bg-muted'
                  >
                    <div
                      className='h-full rounded-full bg-primary'
                      style={{ width: `${(count / topBrandCount) * 100}%` }}
                    />
                  </div>
                  <span className='w-8 text-right text-sm tabular-nums'>
                    {count}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </Page>
  );
};
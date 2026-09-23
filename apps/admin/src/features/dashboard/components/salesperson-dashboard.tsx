import { DataErrorState } from '@/shared/components/data-error-state';
import { Page } from '@/shared/components/page';
import { carListSchema, type PaginatedCars } from '@/shared/schemas/car.schema';
import type { UserDetails } from '@/shared/types/auth-types';
import { formatCurrency } from '@/shared/utils/format-currency';
import { useGetAllQuery } from '@repo/api';
import { CarStatus } from '@repo/api/car-status';
import { Badge } from '@repo/ui/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Empty, EmptyHeader, EmptyTitle } from '@repo/ui/components/empty';
import { DashboardSkeleton } from './dashboard-skeleton';
import { MetricCard } from './metric-card';
import { RecentSalesTable } from './recent-sales-table';

// Placeholder commission rule until the business defines the real rate.
const COMMISSION_RATE = 0.03;

interface SalespersonDashboardProps {
  user: UserDetails;
}

export const SalespersonDashboard = ({ user }: SalespersonDashboardProps) => {
  const {
    data: carsResponse,
    isPending,
    isError,
    refetch,
  } = useGetAllQuery<PaginatedCars>({
    key: 'cars',
    url: '/car',
    params: { limit: 100 },
    schema: carListSchema,
  });

  if (isPending) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return <DataErrorState onRetry={refetch} />;
  }

  const cars = carsResponse?.data.data ?? [];
  const soldCars = cars.filter((car) => car.status === CarStatus.SOLD);
  const availableCars = cars.filter(
    (car) => car.status === CarStatus.AVAILABLE,
  );
  const mySales = soldCars.filter((car) => car.salesPerson?.id === user.id);
  const myRevenue = mySales.reduce(
    (total, car) => total + (car.salePrice ?? car.price),
    0,
  );
  const recentSales = [...mySales]
    .sort((a, b) => (b.soldAt ?? '').localeCompare(a.soldAt ?? ''))
    .slice(0, 5);

  const salesByPerson = new Map<string, { name: string; count: number }>();
  for (const car of soldCars) {
    if (!car.salesPerson) continue;
    const entry = salesByPerson.get(car.salesPerson.id) ?? {
      name: car.salesPerson.name,
      count: 0,
    };
    entry.count += 1;
    salesByPerson.set(car.salesPerson.id, entry);
  }
  const standings = Array.from(salesByPerson.entries())
    .map(([id, entry]) => ({ id, ...entry }))
    .sort((a, b) => b.count - a.count);
  const myRank = standings.findIndex((entry) => entry.id === user.id);

  const firstName = user.name.split(' ')[0];

  return (
    <Page
      title={`Welcome back, ${firstName}`}
      description='Your sales performance at a glance.'
    >

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <MetricCard
          title='My sales'
          value={String(mySales.length)}
          hint='All time'
        />
        <MetricCard title='My revenue' value={formatCurrency(myRevenue)} />
        <MetricCard
          title='Est. commission'
          value={formatCurrency(myRevenue * COMMISSION_RATE)}
          hint='Estimated at 3% — placeholder rate'
        />
        <MetricCard
          title='Available stock'
          value={String(availableCars.length)}
          hint='Ready to sell'
        />
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <RecentSalesTable cars={recentSales} title='My recent sales' />
        <Card>
          <CardHeader>
            <CardTitle>Team standing</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            {myRank >= 0 ? (
              <p className='text-sm text-muted-foreground'>
                Rank #{myRank + 1} of {standings.length}
              </p>
            ) : null}
            {standings.length === 0 ? (
              <Empty className='p-6'>
                <EmptyHeader>
                  <EmptyTitle className='text-sm font-medium'>
                    No sales recorded yet
                  </EmptyTitle>
                </EmptyHeader>
              </Empty>
            ) : (
              standings.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.id}
                  className='flex items-center justify-between gap-3 text-sm'
                >
                  <span className='flex min-w-0 items-center gap-2'>
                    <span className='w-5 text-muted-foreground tabular-nums'>
                      {index + 1}
                    </span>
                    <span className='truncate'>{entry.name}</span>
                  </span>
                  <span className='flex items-center gap-2'>
                    {entry.id === user.id ? (
                      <Badge variant='secondary'>You</Badge>
                    ) : null}
                    <span className='text-muted-foreground tabular-nums'>
                      {entry.count}
                    </span>
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

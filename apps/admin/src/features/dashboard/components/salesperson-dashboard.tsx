import { DataErrorState } from '@/shared/components/data-error-state';
import { Page } from '@/shared/components/page';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import {
  salespersonDashboardSchema,
  type SalespersonDashboard as SalespersonDashboardStats,
} from '@/shared/schemas/dashboard.schema';
import type { UserDetails } from '@/shared/types/auth-types';
import { formatCurrency } from '@/shared/utils/format-currency';
import { truncateLabel } from '@/shared/utils/truncate-label';
import { useGetAllQuery } from '@repo/api';
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
import { Empty, EmptyHeader, EmptyTitle } from '@repo/ui/components/empty';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { DashboardSkeleton } from './dashboard-skeleton';
import { MetricCard } from '@/shared/components/metric-card';
import { RecentSalesTable } from './recent-sales-table';

// Placeholder commission rule until the business defines the real rate.
const COMMISSION_RATE = 0.03;

const standingsChartConfig = {
  count: {
    label: 'Sales',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

interface SalespersonDashboardProps {
  user: UserDetails;
}

export const SalespersonDashboard = ({ user }: SalespersonDashboardProps) => {
  const {
    data: response,
    isPending,
    isError,
    refetch,
  } = useGetAllQuery<SalespersonDashboardStats>({
    key: QUERY_KEYS.salespersonDashboard,
    url: '/dashboard/salesperson',
    schema: salespersonDashboardSchema,
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
    mySalesCount,
    myRevenue,
    availableCarsCount,
    recentSales,
    standings,
  } = dashboard;

  const myRank = standings.findIndex((entry) => entry.id === user.id);
  const myCount = myRank >= 0 ? standings[myRank].count : 0;

  const topStandings = standings.slice(0, 5);
  const includesCurrentUser = topStandings.some(
    (entry) => entry.id === user.id,
  );
  const chartStandings =
    myRank >= 0 && !includesCurrentUser
      ? [...topStandings, standings[myRank]]
      : topStandings;

  const standingsChartData = chartStandings.map((entry) => ({
    id: entry.id,
    name: entry.name,
    count: entry.count,
    isCurrentUser: entry.id === user.id,
  }));

  const standingsChartHeight = Math.max(200, standingsChartData.length * 40);

  const firstName = user.name.split(' ')[0];

  return (
    <Page
      title={`Welcome back, ${firstName}`}
      description="Your sales performance at a glance."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="My sales"
          value={String(mySalesCount)}
          hint="All time"
        />
        <MetricCard title="My revenue" value={formatCurrency(myRevenue)} />
        <MetricCard
          title="Est. commission"
          value={formatCurrency(myRevenue * COMMISSION_RATE)}
          hint="Estimated at 3% — placeholder rate"
        />
        <MetricCard
          title="Available stock"
          value={String(availableCarsCount)}
          hint="Ready to sell"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentSalesTable cars={recentSales} title="My recent sales" />
        <Card>
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Team standing
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {myRank >= 0 ? (
              <p className="text-sm text-muted-foreground">
                Rank #{myRank + 1} of {standings.length}
              </p>
            ) : null}
            {standings.length === 0 ? (
              <Empty className="p-6">
                <EmptyHeader>
                  <EmptyTitle className="text-sm font-medium">
                    No sales recorded yet
                  </EmptyTitle>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <p className="sr-only">
                  Horizontal bar chart of sales by team member, ranked from
                  highest to lowest. You are ranked #{myRank + 1} of{' '}
                  {standings.length} with {myCount}{' '}
                  {myCount === 1 ? 'sale' : 'sales'}.
                </p>
                <ChartContainer
                  config={standingsChartConfig}
                  className="aspect-auto w-full"
                  style={{ height: standingsChartHeight }}
                >
                  <BarChart
                    accessibilityLayer
                    data={standingsChartData}
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
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      width={96}
                      tickFormatter={truncateLabel}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="count" radius={4}>
                      {standingsChartData.map((entry) => (
                        <Cell
                          key={entry.id}
                          fill={
                            entry.isCurrentUser
                              ? 'var(--chart-1)'
                              : 'var(--chart-2)'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </>
            )}
            {standings.length > 0 ? (
              <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-[2px]"
                    style={{ backgroundColor: 'var(--chart-1)' }}
                  />
                  You
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-[2px]"
                    style={{ backgroundColor: 'var(--chart-2)' }}
                  />
                  Team
                </span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </Page>
  );
};

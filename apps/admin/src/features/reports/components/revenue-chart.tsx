import type {
  OwnerReports,
  ReportGroupBy,
} from '@/shared/schemas/reports.schema';
import {
  formatCompactCurrency,
  formatCurrency,
} from '@/shared/utils/format-currency';
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
import { formatDate } from '@repo/utils';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface RevenueChartProps {
  points: OwnerReports['revenueOverTime'];
  groupBy: ReportGroupBy;
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

const formatPeriod = (period: string, groupBy: ReportGroupBy): string => {
  switch (groupBy) {
    case 'day':
      return formatDate(period, 'MMM d');
    case 'week':
      return `Week of ${formatDate(period, 'MMM d')}`;
    case 'month':
      return formatDate(period, 'MMM yyyy');
  }
};

export const RevenueChart = ({ points, groupBy }: RevenueChartProps) => {
  const data = points.map((point) => ({
    period: formatPeriod(point.period, groupBy),
    revenue: point.revenue,
    units: point.units,
  }));

  const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);
  const peak = points.reduce(
    (best, point) => (point.revenue > best.revenue ? point : best),
    points[0],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          Revenue over time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <Empty className="p-6">
            <EmptyHeader>
              <EmptyTitle className="text-sm font-medium">
                No sales in this period
              </EmptyTitle>
              <EmptyDescription>
                Revenue will be charted as sales are recorded.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <p className="sr-only">
              Area chart of revenue over the selected period.{' '}
              {formatCurrency(totalRevenue)} across {points.length}{' '}
              {points.length === 1 ? 'period' : 'periods'}
              {peak
                ? `, peaking at ${formatCurrency(peak.revenue)} in ${formatPeriod(peak.period, groupBy)}`
                : ''}
              .
            </p>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[300px] w-full"
            >
              <AreaChart
                accessibilityLayer
                data={data}
                margin={{ left: 8, right: 12, top: 8 }}
              >
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.75}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={64}
                  tickFormatter={(value: number) =>
                    formatCompactCurrency(value)
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, item) => (
                        <div className="flex w-full items-center justify-between gap-3">
                          <span className="text-muted-foreground">Revenue</span>
                          <span className="flex items-center gap-2">
                            <span className="font-mono font-medium text-foreground tabular-nums">
                              {formatCurrency(Number(value))}
                            </span>
                            <span className="text-muted-foreground">
                              {String(
                                (item.payload as { units: number }).units,
                              )}{' '}
                              sold
                            </span>
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenue)"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
};

import type { OwnerReports } from '@/shared/schemas/reports.schema';
import {
  formatCompactCurrency,
  formatCurrency,
} from '@/shared/utils/format-currency';
import { truncateLabel } from '@/shared/utils/truncate-label';
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface ReportsBrandsListProps {
  brands: OwnerReports['brands'];
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export const ReportsBrandsList = ({ brands }: ReportsBrandsListProps) => {
  const chartHeight = Math.max(240, brands.length * 40);

  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          Sales by brand
        </CardTitle>
      </CardHeader>
      <CardContent>
        {brands.length === 0 ? (
          <Empty className="p-6">
            <EmptyHeader>
              <EmptyTitle className="text-sm font-medium">
                No sales in this period
              </EmptyTitle>
              <EmptyDescription>
                Brand performance will be charted as sales are recorded.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <p className="sr-only">
              Horizontal bar chart of revenue by brand across the selected
              period, ranked from highest to lowest.
            </p>
            <div className="max-h-96 overflow-y-auto pr-1">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto w-full"
                style={{ height: chartHeight }}
              >
                <BarChart
                  accessibilityLayer
                  data={brands}
                  layout="vertical"
                  margin={{ left: 8, right: 12 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) =>
                      formatCompactCurrency(value)
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="brand"
                    tickLine={false}
                    axisLine={false}
                    width={96}
                    tickFormatter={truncateLabel}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value, _name, item) => (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Revenue
                            </span>
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
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

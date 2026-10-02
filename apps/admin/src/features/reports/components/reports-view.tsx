import { DataErrorState } from '@/shared/components/data-error-state';
import { MetricCard } from '@/shared/components/metric-card';
import { Page } from '@/shared/components/page';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import {
  ownerReportsSchema,
  type OwnerReports,
} from '@/shared/schemas/reports.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
import { useGetAllQuery } from '@repo/api';
import { useState } from 'react';
import { getReportRange, type ReportRangePreset } from '../report-ranges';
import { ReportRangePicker } from './report-range-picker';
import { ReportsBrandsList } from './reports-brands-list';
import { ReportsSalespeopleTable } from './reports-salespeople-table';
import { ReportsSkeleton } from './reports-skeleton';
import { ReportsTopClientsTable } from './reports-top-clients-table';
import { RevenueChart } from './revenue-chart';

export const ReportsView = () => {
  const [preset, setPreset] = useState<ReportRangePreset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const isCustom = preset === 'custom';
  const hasCustomDates = Boolean(customFrom && customTo);
  const isCustomRangeValid = !hasCustomDates || customFrom <= customTo;
  const isCustomReady = !isCustom || (hasCustomDates && isCustomRangeValid);

  const range = isCustom
    ? { from: customFrom || undefined, to: customTo || undefined }
    : getReportRange(preset);

  const { data, isPending, isError, refetch } = useGetAllQuery<OwnerReports>({
    key: QUERY_KEYS.reports,
    url: '/reports/owner',
    params: { from: range.from, to: range.to },
    schema: ownerReportsSchema,
    enabled: isCustomReady,
  });

  const reports = data?.data;

  const handlePresetChange = (next: ReportRangePreset) => {
    if (next === 'custom' && !customFrom && !customTo) {
      const base = getReportRange(preset === 'custom' ? '30d' : preset);
      setCustomFrom(base.from ?? '');
      setCustomTo(base.to ?? '');
    }
    setPreset(next);
  };

  const handleCustomFromChange = (value: string) => {
    setCustomFrom(value);
  };

  const handleCustomToChange = (value: string) => {
    setCustomTo(value);
  };

  return (
    <Page
      title='Reports'
      description='Sales performance for the selected period.'
    >
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-4'>
        <ReportRangePicker
          preset={preset}
          onPresetChange={handlePresetChange}
          customFrom={customFrom}
          onCustomFromChange={handleCustomFromChange}
          customTo={customTo}
          onCustomToChange={handleCustomToChange}
        />
        {!isCustomReady ? (
          <div className='flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-8 text-center'>
            <p className='text-sm font-medium'>
              {hasCustomDates
                ? 'Check the date range'
                : 'Choose a start and end date'}
            </p>
            <p className='text-sm text-muted-foreground'>
              {hasCustomDates
                ? 'The start date must be on or before the end date.'
                : 'Select both dates to run this report.'}
            </p>
          </div>
        ) : isPending ? (
          <ReportsSkeleton />
        ) : isError ? (
          <DataErrorState onRetry={refetch} />
        ) : reports ? (
          <>
            <div className='grid gap-4 sm:grid-cols-3'>
              <MetricCard
                title='Revenue'
                value={formatCurrency(reports.summary.revenue)}
              />
              <MetricCard
                title='Cars sold'
                value={String(reports.summary.unitsSold)}
              />
              <MetricCard
                title='Average sale price'
                value={formatCurrency(reports.summary.avgSalePrice)}
                hint='Per car sold'
              />
            </div>
            <RevenueChart
              points={reports.revenueOverTime}
              groupBy={reports.groupBy}
            />
            <div className='grid gap-4 lg:grid-cols-2'>
              <ReportsSalespeopleTable salespeople={reports.salespeople} />
              <ReportsBrandsList brands={reports.brands} />
            </div>
            <ReportsTopClientsTable clients={reports.topClients} />
          </>
        ) : null}
      </div>
    </Page>
  );
};

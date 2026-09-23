import { DataErrorState } from '@/shared/components/data-error-state';
import { Page } from '@/shared/components/page';
import { meResponseSchema, type MeResponse } from '@/shared/schemas/auth.schema';
import { carListSchema, type PaginatedCars } from '@/shared/schemas/car.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
import { useGetAllQuery } from '@repo/api';
import { CarStatus } from '@repo/api/car-status';
import { formatDateTime } from '@repo/utils';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Separator } from '@repo/ui/components/separator';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Link } from '@tanstack/react-router';
import { salespersonRoleLabels } from '../salespeople-role-labels';
import { SalespersonDetailField } from './salesperson-detail-field';
import { SalespersonSalesTable } from './salesperson-sales-table';

const contactLinkClassName =
  'rounded-sm underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50';

interface SalespersonDetailsViewProps {
  salesPersonId: string;
}

export const SalespersonDetailsView = ({
  salesPersonId,
}: SalespersonDetailsViewProps) => {
  const {
    data: salespersonResponse,
    isPending,
    isError,
    refetch,
  } = useGetAllQuery<MeResponse>({
    key: `salesperson-${salesPersonId}`,
    url: `/user/${salesPersonId}`,
    schema: meResponseSchema,
    enabled: Boolean(salesPersonId),
  });

  const {
    data: carsResponse,
    isPending: areCarsPending,
    isError: areCarsError,
    refetch: refetchCars,
  } = useGetAllQuery<PaginatedCars>({
    key: `salesperson-${salesPersonId}-cars`,
    url: '/car',
    params: { limit: 100, salesPersonId },
    schema: carListSchema,
    enabled: Boolean(salesPersonId),
  });

  const salesperson = salespersonResponse?.data;

  if (isPending) {
    return (
      <Page title='Salesperson details' description='Loading salesperson…'>
        <div className='flex flex-col gap-4' aria-busy='true'>
          <span role='status' className='sr-only'>
            Loading salesperson details
          </span>
          <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]'>
            <Skeleton className='h-64 rounded-xl' />
            <Skeleton className='h-64 rounded-xl' />
          </div>
          <Skeleton className='h-64 rounded-xl' />
        </div>
      </Page>
    );
  }

  if (isError || !salesperson) {
    return (
      <Page title='Salesperson details' description='Salesperson unavailable'>
        <DataErrorState
          title="We couldn't load this salesperson."
          description='They may have been removed or the link is invalid.'
          onRetry={refetch}
        />
      </Page>
    );
  }

  const cars = carsResponse?.data.data ?? [];
  const soldCars = cars.filter((car) => car.status === CarStatus.SOLD);
  const availableCars = cars.filter(
    (car) => car.status === CarStatus.AVAILABLE,
  );
  const revenue = soldCars.reduce(
    (total, car) => total + (car.salePrice ?? car.price),
    0,
  );
  const sales = [...soldCars].sort((a, b) =>
    (b.soldAt ?? '').localeCompare(a.soldAt ?? ''),
  );

  const roleSummary = salesperson.roles
    .map((role) => salespersonRoleLabels[role])
    .join(' · ');

  return (
    <Page
      title={salesperson.name}
      description={roleSummary}
      actions={
        <Button variant='outline' render={<Link to='/salespeople' />}>
          Back to salespeople
        </Button>
      }
    >
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]'>
        <Card>
          <CardHeader>
            <CardTitle role='heading' aria-level={2}>
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className='grid gap-4 sm:grid-cols-2'>
              <SalespersonDetailField label='Name'>
                {salesperson.name}
              </SalespersonDetailField>
              <SalespersonDetailField label='Roles'>
                <span className='flex flex-wrap gap-1'>
                  {salesperson.roles.map((role) => (
                    <Badge key={role} variant='secondary'>
                      {salespersonRoleLabels[role]}
                    </Badge>
                  ))}
                </span>
              </SalespersonDetailField>
              <SalespersonDetailField label='Email'>
                {salesperson.email ? (
                  <a
                    href={`mailto:${salesperson.email}`}
                    className={contactLinkClassName}
                  >
                    {salesperson.email}
                  </a>
                ) : (
                  '—'
                )}
              </SalespersonDetailField>
              <SalespersonDetailField label='Phone'>
                {salesperson.phone ? (
                  <a
                    href={`tel:${salesperson.phone}`}
                    className={contactLinkClassName}
                  >
                    {salesperson.phone}
                  </a>
                ) : (
                  '—'
                )}
              </SalespersonDetailField>
              <SalespersonDetailField label='Member since'>
                {formatDateTime(salesperson.createdAt)}
              </SalespersonDetailField>
              <SalespersonDetailField label='Last updated'>
                {formatDateTime(salesperson.updatedAt)}
              </SalespersonDetailField>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle role='heading' aria-level={2}>
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className='flex h-full flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <span className='text-2xl font-semibold tracking-tight tabular-nums'>
                {areCarsPending ? '—' : formatCurrency(revenue)}
              </span>
              <span className='text-xs text-muted-foreground'>
                Revenue from sold cars
              </span>
            </div>

            <Separator />

            <dl className='flex flex-col gap-3 text-sm'>
              <div className='flex items-center justify-between gap-3'>
                <dt className='text-muted-foreground'>Units sold</dt>
                <dd className='tabular-nums'>
                  {areCarsPending ? '—' : soldCars.length}
                </dd>
              </div>
              <div className='flex items-center justify-between gap-3'>
                <dt className='text-muted-foreground'>Active listings</dt>
                <dd className='tabular-nums'>
                  {areCarsPending ? '—' : availableCars.length}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {areCarsPending ? (
        <Skeleton className='h-64 rounded-xl' aria-hidden='true' />
      ) : areCarsError ? (
        <DataErrorState
          title="We couldn't load this salesperson's cars."
          description='Check your connection and try again.'
          onRetry={refetchCars}
        />
      ) : (
        <SalespersonSalesTable cars={sales} />
      )}
    </Page>
  );
};

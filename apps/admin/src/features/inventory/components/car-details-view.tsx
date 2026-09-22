import { Link } from '@tanstack/react-router';
import { useGetAllQuery, usePostQuery } from '@repo/api';
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
import { Skeleton } from '@repo/ui/components/skeleton';
import { toast } from '@repo/ui/components/toast';
import { CheckIcon } from 'lucide-react';
import { DataErrorState } from '@/shared/components/data-error-state';
import { Page } from '@/shared/components/page';
import { carSchema, type Car } from '@/shared/schemas/car.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
import { carStatusLabels } from '../car-status-labels';
import { CarDetailField } from './car-detail-field';
import { CarPhotoGallery } from './car-photo-gallery';
import { RecordSaleDialog } from './record-sale-dialog';

const carStatusDescriptions: Record<CarStatus, string> = {
  [CarStatus.AVAILABLE]: 'This car is in stock and available for sale.',
  [CarStatus.SOLD]: 'This car has been sold to a buyer.',
};

const contactLinkClassName =
  'rounded-sm underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50';

interface CarDetailsViewProps {
  carId: string;
}

export const CarDetailsView = ({ carId }: CarDetailsViewProps) => {
  const { data, isPending, isError, refetch } = useGetAllQuery<Car>({
    key: `car-${carId}`,
    url: `/car/${carId}`,
    schema: carSchema,
    enabled: Boolean(carId),
  });

  const { mutate: undoSale } = usePostQuery<Record<string, never>, Car>({
    key: `car-${carId}`,
    listKey: 'cars',
    schema: carSchema,
  });

  const handleUndoSale = () => {
    undoSale(
      { url: `/car/${carId}/unsell`, attributes: {} },
      {
        onSuccess() {
          toast.add({
            type: 'success',
            title: 'Sale undone',
            description: 'The car is available again.',
          });
        },
      },
    );
  };

  const car = data?.data;

  if (isPending) {
    return (
      <Page title='Car details' description='Loading vehicle…'>
        <div className='flex flex-col gap-4' aria-busy='true'>
          <span role='status' className='sr-only'>
            Loading car details
          </span>
          <div className='grid gap-4 lg:grid-cols-3'>
            <Skeleton className='h-72 rounded-xl lg:col-span-2' />
            <Skeleton className='h-72 rounded-xl' />
          </div>
        </div>
      </Page>
    );
  }

  if (isError || !car) {
    return (
      <Page title='Car details' description='Vehicle unavailable'>
        <DataErrorState
          title="We couldn't load this car."
          description='It may have been removed or the link is invalid.'
          onRetry={refetch}
        />
      </Page>
    );
  }

  const images = car.images ?? [];
  const isSold = car.status === CarStatus.SOLD;
  const displayPrice = isSold ? (car.salePrice ?? car.price) : car.price;
  const priceLabel = isSold ? 'Sold price' : 'Asking price';

  return (
    <Page
      title={`${car.brand} ${car.model}`}
      description={`${car.year} · VIN ${car.vin}`}
      actions={
        <Button variant='outline' render={<Link to='/inventory' />}>
          Back to inventory
        </Button>
      }
    >
      <div className='grid gap-4 lg:grid-cols-5'>
        <div className='lg:col-span-3'>
          <CarPhotoGallery
            images={images}
            label={`${car.brand} ${car.model}`}
          />
        </div>

        <Card className='lg:col-span-2'>
          <CardContent className='flex flex-1 flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <span className='text-3xl font-semibold tracking-tight tabular-nums'>
                {formatCurrency(displayPrice)}
              </span>
              <span className='text-xs text-muted-foreground'>
                {priceLabel}
              </span>
            </div>

            <Badge
              variant={
                car.status === CarStatus.AVAILABLE ? 'secondary' : 'outline'
              }
            >
              {isSold ? <CheckIcon data-icon='inline-start' /> : null}
              {carStatusLabels[car.status]}
            </Badge>

            <p className='text-sm text-muted-foreground'>
              {carStatusDescriptions[car.status]}
            </p>

            {!isSold ? (
              <div className='mt-auto pt-2'>
                <RecordSaleDialog car={car} onUndo={handleUndoSale} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle role='heading' aria-level={2}>
              Vehicle details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className='grid gap-4 sm:grid-cols-2'>
              <CarDetailField label='Brand'>{car.brand}</CarDetailField>
              <CarDetailField label='Model'>{car.model}</CarDetailField>
              <CarDetailField label='Year'>{car.year}</CarDetailField>
              <CarDetailField label='VIN'>{car.vin}</CarDetailField>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle role='heading' aria-level={2}>
              Salesperson
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className='grid gap-4'>
              <CarDetailField label='Name'>
                {car.salesPerson?.name ?? '—'}
              </CarDetailField>
              <CarDetailField label='Email'>
                {car.salesPerson?.email ? (
                  <a
                    href={`mailto:${car.salesPerson.email}`}
                    className={contactLinkClassName}
                  >
                    {car.salesPerson.email}
                  </a>
                ) : (
                  '—'
                )}
              </CarDetailField>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle role='heading' aria-level={2}>
              Buyer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSold ? (
              <dl className='grid gap-4'>
                <CarDetailField label='Name'>
                  {car.client?.name ?? '—'}
                </CarDetailField>
                <CarDetailField label='Email'>
                  {car.client?.email ? (
                    <a
                      href={`mailto:${car.client.email}`}
                      className={contactLinkClassName}
                    >
                      {car.client.email}
                    </a>
                  ) : (
                    '—'
                  )}
                </CarDetailField>
                <CarDetailField label='Sold at'>
                  {formatDateTime(car.soldAt)}
                </CarDetailField>
              </dl>
            ) : (
              <p className='text-sm text-muted-foreground'>
                Not sold yet. This car is still available.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle role='heading' aria-level={2}>
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className='grid gap-4 sm:grid-cols-2'>
              <CarDetailField label='Added to inventory'>
                {formatDateTime(car.createdAt)}
              </CarDetailField>
              <CarDetailField label='Last updated'>
                {formatDateTime(car.updatedAt)}
              </CarDetailField>
            </dl>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
};

import { QUERY_KEYS } from '@/shared/constants/query-keys';
import type { MeResponse } from '@/shared/schemas/auth.schema';
import { carListSchema, type PaginatedCars } from '@/shared/schemas/car.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
import { useGetAllQuery } from '@repo/api';
import { CarStatus } from '@repo/api/car-status';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@repo/ui/components/empty';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { formatShortDate } from '@repo/utils';
import { Link } from '@tanstack/react-router';
import { TriangleAlertIcon } from 'lucide-react';
import { useState } from 'react';

interface CustomerPurchasesDialogProps {
  customer: MeResponse | null;
  onOpenChange: (open: boolean) => void;
}

export const CustomerPurchasesDialog = ({
  customer,
  onOpenChange,
}: CustomerPurchasesDialogProps) => {
  const [activeCustomer, setActiveCustomer] = useState<MeResponse | null>(
    customer,
  );

  if (customer && customer !== activeCustomer) {
    setActiveCustomer(customer);
  }

  const { data, isPending, isError, refetch } = useGetAllQuery<PaginatedCars>({
    key: QUERY_KEYS.cars,
    url: '/car',
    params: {
      clientId: activeCustomer?.id,
      status: CarStatus.SOLD,
      limit: 50,
    },
    schema: carListSchema,
    enabled: customer !== null,
  });

  const purchases = data?.data.data ?? [];
  const meta = data?.data.meta;

  return (
    <Dialog open={customer !== null} onOpenChange={onOpenChange}>
      <DialogContent className='motion-reduce:animate-none max-h-[calc(100vh-2rem)] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {activeCustomer
              ? `${activeCustomer.name}’s purchases`
              : 'Purchases'}
          </DialogTitle>
          <DialogDescription>
            {[
              activeCustomer?.email,
              activeCustomer?.phone,
            ].filter(Boolean).join(' · ') || 'Cars this customer has bought.'}
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className='flex flex-col gap-2' aria-busy='true'>
            <span role='status' className='sr-only'>
              Loading purchases
            </span>
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className='h-8 w-full' />
            ))}
          </div>
        ) : isError ? (
          <div
            role='alert'
            className='flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center'
          >
            <TriangleAlertIcon
              className='size-5 text-muted-foreground'
              aria-hidden='true'
            />
            <p className='text-sm font-medium'>
              We couldn&apos;t load this customer&apos;s purchases.
            </p>
            <Button variant='outline' size='sm' onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : purchases.length === 0 ? (
          <Empty className='p-6'>
            <EmptyHeader>
              <EmptyTitle className='text-sm font-medium'>
                No purchases yet
              </EmptyTitle>
              <EmptyDescription>
                Cars bought by this customer will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableCaption className='sr-only'>
              Cars bought by this customer
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead className='text-right'>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((car) => (
                <TableRow key={car.id}>
                  <TableCell className='font-medium'>
                    <Link
                      to='/inventory/$carId'
                      params={{ carId: car.id }}
                      className='rounded-sm underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
                    >
                      {car.brand} {car.model}
                    </Link>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {formatShortDate(car.soldAt)}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {formatCurrency(car.salePrice ?? car.price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {meta && meta.total > purchases.length ? (
          <p className='text-xs text-muted-foreground'>
            Showing {purchases.length} of {meta.total} purchases.
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

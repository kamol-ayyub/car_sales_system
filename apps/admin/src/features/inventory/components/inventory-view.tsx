import { useState } from 'react';
import { DataErrorState } from '@/shared/components/data-error-state';
import { carListSchema, type Car } from '@/shared/schemas/car.schema';
import { useGetAllQuery } from '@repo/api';
import { Skeleton } from '@repo/ui/components/skeleton';
import type { CarStatusFilterValue } from '../car-status-filter-options';
import { CarStatusFilter } from './car-status-filter';
import { InventoryTable } from './inventory-table';

export const InventoryView = () => {
  const { data, isPending, isError, refetch } = useGetAllQuery<Car[]>({
    key: 'cars',
    url: '/car',
    schema: carListSchema,
  });
  const [statusFilter, setStatusFilter] = useState<CarStatusFilterValue>('all');

  const cars = data?.data ?? [];
  const filteredCars =
    statusFilter === 'all'
      ? cars
      : cars.filter((car) => car.status === statusFilter);

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
            Inventory
          </h1>
          <p className='text-sm text-muted-foreground' aria-live='polite'>
            {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'}
          </p>
        </div>
        <CarStatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      {isPending ? (
        <Skeleton className='h-64 w-full rounded-xl' />
      ) : isError ? (
        <DataErrorState onRetry={refetch} />
      ) : (
        <InventoryTable cars={filteredCars} />
      )}
    </div>
  );
};

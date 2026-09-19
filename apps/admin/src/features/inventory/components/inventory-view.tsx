import { useState } from 'react';
import { carListSchema, type Car } from '@/shared/schemas/car.schema';
import { useGetAllQuery } from '@repo/api';
import { Skeleton } from '@repo/ui/components/skeleton';
import { DataErrorState } from '@/shared/components/data-error-state';
import { Page } from '@/shared/components/page';
import {
  carStatusFilterOptions,
  type CarStatusFilterValue,
} from '../car-status-filter-options';
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
  const isFiltered = statusFilter !== 'all';
  const filteredCars = isFiltered
    ? cars.filter((car) => car.status === statusFilter)
    : cars;
  const filterLabel = carStatusFilterOptions.find(
    (option) => option.value === statusFilter,
  )?.label;

  return (
    <Page
      title='Inventory'
      description={
        isPending ? (
          'Loading inventory…'
        ) : isError ? (
          'Inventory unavailable'
        ) : (
          <p aria-live='polite'>
            {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'}
          </p>
        )
      }
      actions={<CarStatusFilter value={statusFilter} onChange={setStatusFilter} />}
    >
      {isPending ? (
        <Skeleton className='h-64 w-full rounded-xl' />
      ) : isError ? (
        <DataErrorState onRetry={refetch} />
      ) : (
        <InventoryTable
          cars={filteredCars}
          isFiltered={isFiltered}
          filterLabel={filterLabel}
          onClearFilter={() => setStatusFilter('all')}
        />
      )}
    </Page>
  );
};

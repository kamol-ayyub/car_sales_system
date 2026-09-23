import { carListSchema, type PaginatedCars } from '@/shared/schemas/car.schema';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { useGetAllQuery } from '@repo/api';
import { TableSearch } from '@repo/ui/components/table-search';
import { DataErrorState } from '@/shared/components/data-error-state';
import { Page } from '@/shared/components/page';
import { useState } from 'react';
import {
  carStatusFilterOptions,
  type CarStatusFilterValue,
} from '../car-status-filter-options';
import { CarStatusFilter } from './car-status-filter';
import { CreateCarDialog } from './create-car-dialog';
import { InventoryTable } from './inventory-table';
import { InventoryTableSkeleton } from './inventory-table-skeleton';

const PAGE_SIZE = 10;

interface InventoryViewProps {
  statusFilter: CarStatusFilterValue;
  onStatusFilterChange: (value: CarStatusFilterValue) => void;
}

export const InventoryView = ({
  statusFilter,
  onStatusFilterChange,
}: InventoryViewProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const activeSearch = debouncedSearch.trim();

  const { data, isPending, isError, refetch } = useGetAllQuery<PaginatedCars>({
    key: 'cars',
    url: '/car',
    params: {
      page,
      limit: pageSize,
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: activeSearch || undefined,
    },
    schema: carListSchema,
  });

  const cars = data?.data.data ?? [];
  const meta = data?.data.meta;
  const isFiltered = statusFilter !== 'all';
  const filterLabel = carStatusFilterOptions.find(
    (option) => option.value === statusFilter,
  )?.label;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleStatusChange = (value: CarStatusFilterValue) => {
    setPage(1);
    onStatusFilterChange(value);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setPage(1);
    onStatusFilterChange('all');
  };

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
            {meta?.total ?? 0} {(meta?.total ?? 0) === 1 ? 'car' : 'cars'}
          </p>
        )
      }
      actions={<CreateCarDialog />}
    >
      <div className='flex flex-col gap-3'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <TableSearch
            value={searchInput}
            onChange={handleSearchChange}
            placeholder='Search brand, model, or VIN'
            label='Search inventory'
          />
          <CarStatusFilter value={statusFilter} onChange={handleStatusChange} />
        </div>
        {isPending ? (
          <InventoryTableSkeleton rows={pageSize} />
        ) : isError ? (
          <DataErrorState onRetry={refetch} />
        ) : (
          <InventoryTable
            cars={cars}
            meta={meta}
            isFiltered={isFiltered}
            filterLabel={filterLabel}
            searchQuery={activeSearch}
            onClearFilter={handleClearFilters}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </Page>
  );
};

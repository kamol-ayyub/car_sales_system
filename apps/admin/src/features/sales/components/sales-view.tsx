import { DataErrorState } from '@/shared/components/data-error-state';
import { Page } from '@/shared/components/page';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { meResponseSchema } from '@/shared/schemas/auth.schema';
import { carListSchema, type PaginatedCars } from '@/shared/schemas/car.schema';
import { UserRole, type UserDetails } from '@/shared/types/auth-types';
import { useGetAllQuery } from '@repo/api';
import { TableSearch } from '@repo/ui/components/table-search';
import { useState } from 'react';
import { SalespersonFilter } from './salesperson-filter';
import { SalesTable } from './sales-table';
import { SalesTableSkeleton } from './sales-table-skeleton';

const PAGE_SIZE = 10;

interface SalesViewProps {
  salesPersonId?: string;
  onSalesPersonChange: (salesPersonId?: string) => void;
}

export const SalesView = ({
  salesPersonId,
  onSalesPersonChange,
}: SalesViewProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const activeSearch = debouncedSearch.trim();

  const { data: userResponse } = useGetAllQuery<UserDetails>({
    key: QUERY_KEYS.userDetails,
    url: '/user/me',
    schema: meResponseSchema,
  });

  const isOwner = userResponse?.data.roles.includes(UserRole.Owner) ?? false;

  const { data, isPending, isError, refetch } = useGetAllQuery<PaginatedCars>({
    key: QUERY_KEYS.sales,
    url: '/sales',
    params: {
      page,
      limit: pageSize,
      search: activeSearch || undefined,
      salesPersonId: isOwner ? salesPersonId : undefined,
    },
    schema: carListSchema,
    enabled: Boolean(userResponse),
  });

  const sales = data?.data.data ?? [];
  const meta = data?.data.meta;
  const isFiltered = isOwner && salesPersonId !== undefined;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleSalesPersonChange = (value?: string) => {
    setPage(1);
    onSalesPersonChange(value);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setPage(1);
    onSalesPersonChange(undefined);
  };

  return (
    <Page
      title={isOwner ? 'Sales' : 'My sales'}
      description={
        <p role='status' aria-live='polite'>
          {isPending
            ? 'Loading sales…'
            : isError
              ? 'Sales unavailable'
              : `${meta?.total ?? 0} ${(meta?.total ?? 0) === 1 ? 'sale' : 'sales'}`}
        </p>
      }
    >
      <div className='flex flex-col gap-3'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <TableSearch
            value={searchInput}
            onChange={handleSearchChange}
            placeholder='Search brand, model, or VIN'
            label='Search sales'
          />
          {isOwner ? (
            <SalespersonFilter
              value={salesPersonId}
              onChange={handleSalesPersonChange}
            />
          ) : null}
        </div>
        {isPending ? (
          <SalesTableSkeleton rows={pageSize} showSalesperson={isOwner} />
        ) : isError ? (
          <DataErrorState onRetry={refetch} />
        ) : (
          <SalesTable
            sales={sales}
            meta={meta}
            showSalesperson={isOwner}
            isFiltered={isFiltered}
            searchQuery={activeSearch}
            onClearFilters={handleClearFilters}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </Page>
  );
};

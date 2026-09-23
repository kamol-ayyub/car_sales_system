import { DataErrorState } from '@/shared/components/data-error-state';
import { Page } from '@/shared/components/page';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { userListSchema, type PaginatedUsers } from '@/shared/schemas/user.schema';
import { UserRole } from '@/shared/types/auth-types';
import { useGetAllQuery } from '@repo/api';
import { TableSearch } from '@repo/ui/components/table-search';
import { useState } from 'react';
import { SalespeopleTable } from './salespeople-table';
import { SalespeopleTableSkeleton } from './salespeople-table-skeleton';

const PAGE_SIZE = 10;

export const SalespeopleView = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const activeSearch = debouncedSearch.trim();

  const { data, isPending, isError, refetch } = useGetAllQuery<PaginatedUsers>({
    key: 'salespeople',
    url: '/user',
    params: {
      role: UserRole.SalesPerson,
      page,
      limit: pageSize,
      search: activeSearch || undefined,
    },
    schema: userListSchema,
  });

  const salespeople = data?.data.data ?? [];
  const meta = data?.data.meta;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  return (
    <Page
      title='Salespeople'
      description={
        isPending ? (
          'Loading salespeople…'
        ) : isError ? (
          'Salespeople unavailable'
        ) : (
          <p aria-live='polite'>
            {meta?.total ?? 0}{' '}
            {(meta?.total ?? 0) === 1 ? 'salesperson' : 'salespeople'}
          </p>
        )
      }
    >
      <div className='flex flex-col gap-3'>
        <TableSearch
          value={searchInput}
          onChange={handleSearchChange}
          placeholder='Search by name, email, or phone'
          label='Search salespeople'
        />
        {isPending ? (
          <SalespeopleTableSkeleton rows={pageSize} />
        ) : isError ? (
          <DataErrorState onRetry={refetch} />
        ) : (
          <SalespeopleTable
            salespeople={salespeople}
            meta={meta}
            searchQuery={activeSearch}
            onClearSearch={() => handleSearchChange('')}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </Page>
  );
};

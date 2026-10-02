import { DataErrorState } from '@/shared/components/data-error-state';
import { Page } from '@/shared/components/page';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import {
  userListSchema,
  type PaginatedUsers,
} from '@/shared/schemas/user.schema';
import { useGetAllQuery } from '@repo/api';
import { TableSearch } from '@repo/ui/components/table-search';
import { useState } from 'react';
import { CreateCustomerDialog } from './create-customer-dialog';
import { CustomersTable } from './customers-table';
import { CustomersTableSkeleton } from './customers-table-skeleton';

const PAGE_SIZE = 10;

export const CustomersView = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const activeSearch = debouncedSearch.trim();

  const { data, isPending, isError, refetch } = useGetAllQuery<PaginatedUsers>({
    key: QUERY_KEYS.clients,
    url: '/user/clients',
    params: {
      page,
      limit: pageSize,
      search: activeSearch || undefined,
    },
    schema: userListSchema,
  });

  const customers = data?.data.data ?? [];
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
      title='Customers'
      description={
        <p role='status' aria-live='polite'>
          {isPending
            ? 'Loading customers…'
            : isError
              ? 'Customers unavailable'
              : `${meta?.total ?? 0} ${(meta?.total ?? 0) === 1 ? 'customer' : 'customers'}`}
        </p>
      }
      actions={<CreateCustomerDialog />}
    >
      <div className='flex flex-col gap-3'>
        <TableSearch
          value={searchInput}
          onChange={handleSearchChange}
          placeholder='Search by name, email, or phone'
          label='Search customers'
        />
        {isPending ? (
          <CustomersTableSkeleton rows={pageSize} />
        ) : isError ? (
          <DataErrorState onRetry={refetch} />
        ) : (
          <CustomersTable
            customers={customers}
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

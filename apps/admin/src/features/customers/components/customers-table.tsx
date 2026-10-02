import type { MeResponse } from '@/shared/schemas/auth.schema';
import type { Paginated } from '@repo/api';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@repo/ui/components/empty';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { TablePagination } from '@repo/ui/components/table-pagination';
import { formatShortDate } from '@repo/utils';
import { useState } from 'react';
import { customersTableColumns } from '../customers-table-columns';
import { CustomerPurchasesDialog } from './customer-purchases-dialog';

interface CustomersTableProps {
  customers: MeResponse[];
  meta?: Paginated<MeResponse>['meta'];
  searchQuery: string;
  onClearSearch: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const CustomersTable = ({
  customers,
  meta,
  searchQuery,
  onClearSearch,
  onPageChange,
  onPageSizeChange,
}: CustomersTableProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<MeResponse | null>(
    null,
  );

  const emptyTitle = searchQuery
    ? `No customers match “${searchQuery}”`
    : 'No customers yet';
  const emptyDescription = searchQuery
    ? 'Try a different name, email, or phone number.'
    : 'Customers added by your team will appear here.';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle role='heading' aria-level={2}>
            Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <Empty className='p-6'>
              <EmptyHeader>
                <EmptyTitle className='text-sm font-medium'>
                  {emptyTitle}
                </EmptyTitle>
                <EmptyDescription>{emptyDescription}</EmptyDescription>
              </EmptyHeader>
              {searchQuery ? (
                <EmptyContent>
                  <Button variant='outline' size='sm' onClick={onClearSearch}>
                    Clear search
                  </Button>
                </EmptyContent>
              ) : null}
            </Empty>
          ) : (
            <>
              <Table>
                <TableCaption className='sr-only'>
                  List of customers
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    {customersTableColumns.map((column) => (
                      <TableHead
                        key={column.label}
                        className={column.headerClassName}
                      >
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className='relative cursor-pointer'
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <TableCell className='font-medium'>
                        <button
                          type='button'
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedCustomer(customer);
                          }}
                          className="rounded-sm text-left after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:underline focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring/50"
                        >
                          {customer.name}
                        </button>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {customer.phone ?? '—'}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {customer.email ?? '—'}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {formatShortDate(customer.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {meta ? (
                <TablePagination
                  page={meta.page}
                  pageSize={meta.limit}
                  total={meta.total}
                  totalPages={meta.totalPages}
                  onPageChange={onPageChange}
                  onPageSizeChange={onPageSizeChange}
                  className='border-t pt-4'
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
      <CustomerPurchasesDialog
        customer={selectedCustomer}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCustomer(null);
          }
        }}
      />
    </>
  );
};

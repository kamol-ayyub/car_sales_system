import type { Car } from '@/shared/schemas/car.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
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
import { Link, useNavigate } from '@tanstack/react-router';
import { getSalesTableColumns } from '../sales-table-columns';

interface SalesTableProps {
  sales: Car[];
  meta?: Paginated<Car>['meta'];
  showSalesperson: boolean;
  isFiltered: boolean;
  searchQuery: string;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const SalesTable = ({
  sales,
  meta,
  showSalesperson,
  isFiltered,
  searchQuery,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
}: SalesTableProps) => {
  const navigate = useNavigate();
  const columns = getSalesTableColumns(showSalesperson);

  const hasFilters = isFiltered || searchQuery.length > 0;
  const emptyTitle = searchQuery
    ? `No sales match “${searchQuery}”`
    : isFiltered
      ? 'No sales for this salesperson'
      : 'No sales yet';
  const emptyDescription = hasFilters
    ? 'Try a different search or clear the filters.'
    : 'Cars marked as sold will appear here.';

  return (
    <Card>
      <CardHeader>
        <CardTitle role='heading' aria-level={2}>
          Sales
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <Empty className='p-6'>
            <EmptyHeader>
              <EmptyTitle className='text-sm font-medium'>
                {emptyTitle}
              </EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
            {hasFilters ? (
              <EmptyContent>
                <Button variant='outline' size='sm' onClick={onClearFilters}>
                  Clear filters
                </Button>
              </EmptyContent>
            ) : null}
          </Empty>
        ) : (
          <>
            <Table>
              <TableCaption className='sr-only'>List of sales</TableCaption>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
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
                {sales.map((car) => (
                  <TableRow
                    key={car.id}
                    className='relative cursor-pointer'
                    onClick={() =>
                      navigate({
                        to: '/inventory/$carId',
                        params: { carId: car.id },
                      })
                    }
                  >
                    <TableCell className='font-medium'>
                      <Link
                        to='/inventory/$carId'
                        params={{ carId: car.id }}
                        onClick={(event) => event.stopPropagation()}
                        className="rounded-sm after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:underline focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring/50"
                      >
                        {car.brand} {car.model}
                      </Link>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {car.vin}
                    </TableCell>
                    <TableCell>{car.client?.name ?? '—'}</TableCell>
                    {showSalesperson ? (
                      <TableCell>{car.salesPerson?.name ?? '—'}</TableCell>
                    ) : null}
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
  );
};

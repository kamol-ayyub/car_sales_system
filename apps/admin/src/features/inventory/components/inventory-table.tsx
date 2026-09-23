import type { Car } from '@/shared/schemas/car.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
import type { Paginated } from '@repo/api';
import { CarStatus } from '@repo/api/car-status';
import { Badge } from '@repo/ui/components/badge';
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
import { Link, useNavigate } from '@tanstack/react-router';
import { CheckIcon } from 'lucide-react';
import { carStatusLabels } from '../car-status-labels';
import { inventoryTableColumns } from '../inventory-table-columns';

interface InventoryTableProps {
  cars: Car[];
  meta?: Paginated<Car>['meta'];
  isFiltered: boolean;
  filterLabel?: string;
  searchQuery: string;
  onClearFilter: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const InventoryTable = ({
  cars,
  meta,
  isFiltered,
  filterLabel,
  searchQuery,
  onClearFilter,
  onPageChange,
  onPageSizeChange,
}: InventoryTableProps) => {
  const navigate = useNavigate();

  const hasFilters = isFiltered || searchQuery.length > 0;
  const emptyTitle = searchQuery
    ? `No cars match “${searchQuery}”`
    : isFiltered
      ? `No ${filterLabel?.toLowerCase()} cars`
      : 'No cars in inventory yet';
  const emptyDescription = hasFilters
    ? 'Try a different search or clear the filters.'
    : 'Cars added to inventory will appear here.';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicles</CardTitle>
      </CardHeader>
      <CardContent>
        {cars.length === 0 ? (
          <Empty className='p-6'>
            <EmptyHeader>
              <EmptyTitle className='text-sm font-medium'>
                {emptyTitle}
              </EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
            {hasFilters ? (
              <EmptyContent>
                <Button variant='outline' size='sm' onClick={onClearFilter}>
                  Clear filters
                </Button>
              </EmptyContent>
            ) : null}
          </Empty>
        ) : (
          <>
            <Table>
              <TableCaption className='sr-only'>Inventory of cars</TableCaption>
              <TableHeader>
                <TableRow>
                  {inventoryTableColumns.map((column) => (
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
                {cars.map((car) => (
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
                    <TableCell>{car.year}</TableCell>
                    <TableCell className='tabular-nums'>
                      {formatCurrency(car.salePrice ?? car.price)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          car.status === CarStatus.AVAILABLE
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {car.status === CarStatus.SOLD ? (
                          <CheckIcon data-icon='inline-start' />
                        ) : null}
                        {carStatusLabels[car.status]}
                      </Badge>
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

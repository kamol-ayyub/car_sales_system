import type { Car } from '@/shared/schemas/car.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
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
import { Link, useNavigate } from '@tanstack/react-router';
import { CheckIcon } from 'lucide-react';
import { carStatusLabels } from '../car-status-labels';

interface InventoryTableProps {
  cars: Car[];
  isFiltered: boolean;
  filterLabel?: string;
  onClearFilter: () => void;
}

export const InventoryTable = ({
  cars,
  isFiltered,
  filterLabel,
  onClearFilter,
}: InventoryTableProps) => {
  const navigate = useNavigate();

  const tableHeadOrder = ['Car', 'VIN', 'Year', 'Price', 'Status'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicles</CardTitle>
      </CardHeader>
      <CardContent>
        {cars.length === 0 ? (
          isFiltered ? (
            <Empty className='p-6'>
              <EmptyHeader>
                <EmptyTitle className='text-sm font-medium'>
                  No {filterLabel?.toLowerCase()} cars
                </EmptyTitle>
                <EmptyDescription>
                  Clear the filter to see the rest of the inventory.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant='outline' size='sm' onClick={onClearFilter}>
                  Clear filter
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Empty className='p-6'>
              <EmptyHeader>
                <EmptyTitle className='text-sm font-medium'>
                  No cars in inventory yet
                </EmptyTitle>
                <EmptyDescription>
                  Cars added to inventory will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )
        ) : (
          <Table>
            <TableCaption className='sr-only'>Inventory of cars</TableCaption>
            <TableHeader>
              <TableRow>
                {tableHeadOrder.map((item) => (
                  <TableHead key={item}>{item}</TableHead>
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
        )}
      </CardContent>
    </Card>
  );
};

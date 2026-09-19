import type { Car } from '@/shared/schemas/car.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
import { CarStatus } from '@repo/api/car-status';
import { Badge } from '@repo/ui/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Empty,
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
import { CheckIcon } from 'lucide-react';

const carStatusLabels: Record<CarStatus, string> = {
  [CarStatus.AVAILABLE]: 'Available',
  [CarStatus.SOLD]: 'Sold',
};

interface InventoryTableProps {
  cars: Car[];
}

export const InventoryTable = ({ cars }: InventoryTableProps) => {
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
                No cars match this filter
              </EmptyTitle>
              <EmptyDescription>
                Try a different status filter.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableCaption className='sr-only'>Inventory of cars</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell className='font-medium'>
                    {car.brand} {car.model}
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

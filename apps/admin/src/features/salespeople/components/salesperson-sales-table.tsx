import type { Car } from '@/shared/schemas/car.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
import { formatShortDate } from '@repo/utils';
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
import { Link } from '@tanstack/react-router';

interface SalespersonSalesTableProps {
  cars: Car[];
}

export const SalespersonSalesTable = ({
  cars,
}: SalespersonSalesTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle role='heading' aria-level={2}>
          Sales
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cars.length === 0 ? (
          <Empty className='p-6'>
            <EmptyHeader>
              <EmptyTitle className='text-sm font-medium'>
                No sales yet
              </EmptyTitle>
              <EmptyDescription>
                Cars sold by this salesperson will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableCaption className='sr-only'>
              Cars sold by this salesperson
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead className='text-right'>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell className='font-medium'>
                    <Link
                      to='/inventory/$carId'
                      params={{ carId: car.id }}
                      className='rounded-sm underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
                    >
                      {car.brand} {car.model}
                    </Link>
                  </TableCell>
                  <TableCell>{car.client?.name ?? '—'}</TableCell>
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
        )}
      </CardContent>
    </Card>
  );
};

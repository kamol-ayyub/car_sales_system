import type { Car } from '@/shared/schemas/car.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Empty, EmptyHeader, EmptyTitle } from '@repo/ui/components/empty';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';

const soldDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

const formatSoldDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : soldDateFormatter.format(date);
};

interface RecentSalesTableProps {
  cars: Car[];
  title?: string;
}

export const RecentSalesTable = ({
  cars,
  title = 'Recent sales',
}: RecentSalesTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {cars.length === 0 ? (
          <Empty className='p-6'>
            <EmptyHeader>
              <EmptyTitle className='text-sm font-medium'>
                No sales yet
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableCaption className='sr-only'>{title}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Salesperson</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead className='text-right'>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell className='font-medium'>
                    {car.brand} {car.model}
                  </TableCell>
                  <TableCell>{car.client?.name ?? '—'}</TableCell>
                  <TableCell>{car.salesPerson?.name ?? '—'}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {car.soldAt ? formatSoldDate(car.soldAt) : '—'}
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

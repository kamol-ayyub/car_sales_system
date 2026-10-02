import type { OwnerReports } from '@/shared/schemas/reports.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
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

interface ReportsSalespeopleTableProps {
  salespeople: OwnerReports['salespeople'];
}

export const ReportsSalespeopleTable = ({
  salespeople,
}: ReportsSalespeopleTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle role='heading' aria-level={2}>
          Sales by salesperson
        </CardTitle>
      </CardHeader>
      <CardContent>
        {salespeople.length === 0 ? (
          <Empty className='p-6'>
            <EmptyHeader>
              <EmptyTitle className='text-sm font-medium'>
                No sales in this period
              </EmptyTitle>
              <EmptyDescription>
                Salesperson performance will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableCaption className='sr-only'>
              Sales performance by salesperson
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Salesperson</TableHead>
                <TableHead className='text-right'>Sold</TableHead>
                <TableHead className='text-right'>Revenue</TableHead>
                <TableHead className='text-right'>Avg price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salespeople.map((row) => (
                <TableRow key={row.salesPerson.id}>
                  <TableCell className='font-medium'>
                    {row.salesPerson.name}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {row.units}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {formatCurrency(row.revenue)}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {formatCurrency(row.avgSalePrice)}
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

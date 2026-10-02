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

interface ReportsTopClientsTableProps {
  clients: OwnerReports['topClients'];
}

export const ReportsTopClientsTable = ({
  clients,
}: ReportsTopClientsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle role='heading' aria-level={2}>
          Top customers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <Empty className='p-6'>
            <EmptyHeader>
              <EmptyTitle className='text-sm font-medium'>
                No sales in this period
              </EmptyTitle>
              <EmptyDescription>
                Your top customers will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableCaption className='sr-only'>
              Top customers by total spend
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className='text-right'>Purchases</TableHead>
                <TableHead className='text-right'>Total spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((row) => (
                <TableRow key={row.client.id}>
                  <TableCell className='font-medium'>
                    {row.client.name}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {row.purchases}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {formatCurrency(row.totalSpent)}
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

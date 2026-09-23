import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { salespeopleTableColumns } from '../salespeople-table-columns';

interface SalespeopleTableSkeletonProps {
  rows?: number;
}

export const SalespeopleTableSkeleton = ({
  rows = 10,
}: SalespeopleTableSkeletonProps) => {
  return (
    <Card aria-hidden='true'>
      <CardHeader>
        <CardTitle>Salespeople</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {salespeopleTableColumns.map((column) => (
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
            {Array.from({ length: rows }, (_, rowIndex) => (
              <TableRow key={rowIndex}>
                {salespeopleTableColumns.map((column) => (
                  <TableCell key={column.label}>
                    <Skeleton className={column.skeletonClassName} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className='flex flex-wrap items-center justify-between gap-3 border-t pt-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-8 w-20' />
            <Skeleton className='h-4 w-24' />
          </div>
          <Skeleton className='h-9 w-56' />
        </div>
      </CardContent>
    </Card>
  );
};

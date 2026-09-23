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
import { inventoryTableColumns } from '../inventory-table-columns';

interface InventoryTableSkeletonProps {
  rows?: number;
}

export const InventoryTableSkeleton = ({
  rows = 10,
}: InventoryTableSkeletonProps) => {
  return (
    <Card aria-hidden='true'>
      <CardHeader>
        <CardTitle>Vehicles</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
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
            {Array.from({ length: rows }, (_, rowIndex) => (
              <TableRow key={rowIndex}>
                {inventoryTableColumns.map((column) => (
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

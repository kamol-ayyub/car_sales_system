import type { MeResponse } from '@/shared/schemas/auth.schema';
import type { Paginated } from '@repo/api';
import { formatShortDate } from '@repo/utils';
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
import { salespeopleTableColumns } from '../salespeople-table-columns';

interface SalespeopleTableProps {
  salespeople: MeResponse[];
  meta?: Paginated<MeResponse>['meta'];
  searchQuery: string;
  onClearSearch: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const SalespeopleTable = ({
  salespeople,
  meta,
  searchQuery,
  onClearSearch,
  onPageChange,
  onPageSizeChange,
}: SalespeopleTableProps) => {
  const navigate = useNavigate();

  const emptyTitle = searchQuery
    ? `No salespeople match “${searchQuery}”`
    : 'No salespeople yet';
  const emptyDescription = searchQuery
    ? 'Try a different name, email, or phone number.'
    : 'Salespeople on your team will appear here.';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
      </CardHeader>
      <CardContent>
        {salespeople.length === 0 ? (
          <Empty className='p-6'>
            <EmptyHeader>
              <EmptyTitle className='text-sm font-medium'>
                {emptyTitle}
              </EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
            {searchQuery ? (
              <EmptyContent>
                <Button variant='outline' size='sm' onClick={onClearSearch}>
                  Clear search
                </Button>
              </EmptyContent>
            ) : null}
          </Empty>
        ) : (
          <>
            <Table>
              <TableCaption className='sr-only'>
                List of salespeople
              </TableCaption>
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
                {salespeople.map((salesperson) => (
                  <TableRow
                    key={salesperson.id}
                    className='relative cursor-pointer'
                    onClick={() =>
                      navigate({
                        to: '/salespeople/$salesPersonId',
                        params: { salesPersonId: salesperson.id },
                      })
                    }
                  >
                    <TableCell className='font-medium'>
                      <Link
                        to='/salespeople/$salesPersonId'
                        params={{ salesPersonId: salesperson.id }}
                        onClick={(event) => event.stopPropagation()}
                        className="rounded-sm after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:underline focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring/50"
                      >
                        {salesperson.name}
                      </Link>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {salesperson.email ?? '—'}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {salesperson.phone ?? '—'}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {formatShortDate(salesperson.createdAt)}
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

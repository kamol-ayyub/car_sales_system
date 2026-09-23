import { cn } from 'cn';
import { useId } from 'react';

import { Field, FieldLabel } from '@repo/ui/components/field';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@repo/ui/components/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

type PageItem = number | 'ellipsis';

function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = Array.from(new Set([1, page - 1, page, page + 1, totalPages]))
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  let previousPage = 0;

  for (const currentPage of pages) {
    if (previousPage && currentPage - previousPage > 1) {
      items.push('ellipsis');
    }
    items.push(currentPage);
    previousPage = currentPage;
  }

  return items;
}

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

function TablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}: TablePaginationProps) {
  const pageSizeId = useId();

  if (total === 0) {
    return null;
  }

  const pageItems = getPageItems(page, totalPages);
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <div
      data-slot='table-pagination'
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        className,
      )}
    >
      <div className='flex flex-wrap items-center gap-3'>
        {onPageSizeChange ? (
          <Field orientation='horizontal' className='w-auto'>
            <FieldLabel htmlFor={pageSizeId}>Rows per page</FieldLabel>
            <Select
              items={pageSizeOptions.map((option) => ({
                value: option,
                label: option,
              }))}
              value={pageSize}
              onValueChange={(value) => {
                if (value !== null) {
                  onPageSizeChange(value);
                }
              }}
            >
              <SelectTrigger id={pageSizeId} size='sm' className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}
        <p
          className='text-sm text-muted-foreground tabular-nums'
          aria-live='polite'
        >
          {firstItem}–{lastItem} of {total}
        </p>
      </div>
      <Pagination className='mx-0 w-auto justify-end'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href='#'
              aria-disabled={page <= 1}
              className={cn(page <= 1 && 'pointer-events-none opacity-50')}
              onClick={(event) => {
                event.preventDefault();
                if (page > 1) {
                  onPageChange(page - 1);
                }
              }}
            />
          </PaginationItem>
          {pageItems.map((item, index) =>
            item === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  href='#'
                  isActive={item === page}
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(item);
                  }}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              href='#'
              aria-disabled={page >= totalPages}
              className={cn(
                page >= totalPages && 'pointer-events-none opacity-50',
              )}
              onClick={(event) => {
                event.preventDefault();
                if (page < totalPages) {
                  onPageChange(page + 1);
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export { DEFAULT_PAGE_SIZE_OPTIONS, TablePagination };
export type { TablePaginationProps };

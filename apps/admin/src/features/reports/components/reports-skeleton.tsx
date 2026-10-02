import {
  Card,
  CardContent,
  CardHeader,
} from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';

export const ReportsSkeleton = () => {
  return (
    <div className='flex flex-col gap-4' aria-busy='true'>
      <span role='status' className='sr-only'>
        Loading reports
      </span>
      <div className='grid gap-4 sm:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} size='sm'>
            <CardHeader>
              <Skeleton className='h-4 w-24' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-7 w-28' />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className='h-56 w-full rounded-xl' />
      <div className='grid gap-4 lg:grid-cols-2'>
        <Skeleton className='h-64 w-full rounded-xl' />
        <Skeleton className='h-64 w-full rounded-xl' />
      </div>
      <Skeleton className='h-52 w-full rounded-xl' />
    </div>
  );
};

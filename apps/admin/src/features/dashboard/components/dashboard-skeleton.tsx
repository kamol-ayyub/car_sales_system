import {
  Card,
  CardContent,
  CardHeader,
} from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';

export const DashboardSkeleton = () => {
  return (
    <div className='flex flex-col gap-6' aria-busy='true'>
      <span role='status' className='sr-only'>
        Loading dashboard
      </span>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-7 w-48' />
        <Skeleton className='h-4 w-64' />
      </div>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} size='sm'>
            <CardHeader>
              <Skeleton className='h-4 w-24' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-7 w-20' />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='grid gap-4 lg:grid-cols-2'>
        <Skeleton className='h-64 w-full rounded-xl' />
        <Skeleton className='h-64 w-full rounded-xl' />
      </div>
    </div>
  );
};

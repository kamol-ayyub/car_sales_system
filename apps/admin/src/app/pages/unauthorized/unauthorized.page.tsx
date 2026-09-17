import { Link } from '@tanstack/react-router';
import { Button } from '@repo/ui/components/button';

export const UnauthorizedPage = () => {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center p-8 text-center'>
      <div className='max-w-md space-y-4'>
        <div className='inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'>
          <span className='text-2xl font-bold'>403</span>
        </div>
        <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
          Access Restricted
        </h1>
        <p className='text-sm text-gray-500'>
          You do not have permission to view this page.
        </p>
        <div className='pt-2'>
          <Link to='/'>
            <Button variant='default'>Go to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

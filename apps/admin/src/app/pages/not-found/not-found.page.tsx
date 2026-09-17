import { Link } from '@tanstack/react-router';
import { Button } from '@repo/ui/components/button';

export const NotFoundPage = () => {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center p-8 text-center'>
      <div className='max-w-md space-y-4'>
        <div className='inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'>
          <span className='text-2xl font-bold'>404</span>
        </div>
        <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
          Page Not Found
        </h1>
        <p className='text-sm text-gray-500'>
          Sorry, the page you visited does not exist.
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

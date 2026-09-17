import type { ErrorComponentProps } from '@tanstack/react-router';
import { Button } from '@repo/ui/components/button';

export const RouteErrorFallback = ({ error, reset }: ErrorComponentProps) => {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'An unexpected error occurred.';

  return (
    <div className='flex min-h-[400px] flex-col items-center justify-center p-8 text-center'>
      <div className='max-w-md space-y-4'>
        <div className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'>
          <span className='text-xl font-bold'>!</span>
        </div>
        <h2 className='text-xl font-semibold tracking-tight'>
          Failed to load page
        </h2>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          {errorMessage}
        </p>
        {reset && (
          <Button variant='default' onClick={reset}>
            Try again
          </Button>
        )}
      </div>
    </div>
  );
};

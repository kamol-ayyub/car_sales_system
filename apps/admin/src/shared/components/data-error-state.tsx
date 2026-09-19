import { Button } from '@repo/ui/components/button';
import { TriangleAlertIcon } from 'lucide-react';

interface DataErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const DataErrorState = ({
  title = "We couldn't load this data.",
  description = 'Check your connection and try again.',
  onRetry,
}: DataErrorStateProps) => {
  return (
    <div
      role='alert'
      className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center'
    >
      <TriangleAlertIcon
        className='size-6 text-muted-foreground'
        aria-hidden='true'
      />
      <div className='flex flex-col gap-1'>
        <p className='text-sm font-medium'>{title}</p>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
      {onRetry ? (
        <Button variant='outline' size='sm' onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
};

import type { ReactNode } from 'react';

interface CarDetailFieldProps {
  label: string;
  children: ReactNode;
}

export const CarDetailField = ({ label, children }: CarDetailFieldProps) => {
  return (
    <div className='flex min-w-0 flex-col gap-1'>
      <dt className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
        {label}
      </dt>
      <dd className='text-sm break-words text-foreground'>{children}</dd>
    </div>
  );
};

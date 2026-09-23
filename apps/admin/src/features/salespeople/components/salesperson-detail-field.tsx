import type { ReactNode } from 'react';

interface SalespersonDetailFieldProps {
  label: string;
  children: ReactNode;
}

export const SalespersonDetailField = ({
  label,
  children,
}: SalespersonDetailFieldProps) => {
  return (
    <div className='flex min-w-0 flex-col gap-1'>
      <dt className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
        {label}
      </dt>
      <dd className='text-sm break-words text-foreground'>{children}</dd>
    </div>
  );
};

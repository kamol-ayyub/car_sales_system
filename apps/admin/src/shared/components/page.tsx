import type { ReactNode } from 'react';

interface PageProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export const Page = ({ title, description, actions, children }: PageProps) => {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
            {title}
          </h1>
          {description ? (
            <div className='text-sm text-muted-foreground'>{description}</div>
          ) : null}
        </div>
        {actions ? (
          <div className='flex flex-wrap items-center justify-end gap-2'>
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
};

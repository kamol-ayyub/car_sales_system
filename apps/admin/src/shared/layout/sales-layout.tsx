import type { ReactNode } from 'react';

interface SalesLayoutProps {
  children?: ReactNode;
}

export const SalesLayout = ({ children }: SalesLayoutProps) => {
  return (
    <div className='min-h-screen bg-white p-6 space-y-6'>
      <header className='border-b pb-4'>
        <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
          Sales Layout
        </h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

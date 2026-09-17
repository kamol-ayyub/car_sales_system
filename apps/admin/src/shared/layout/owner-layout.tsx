import type { ReactNode } from 'react';

interface OwnerLayoutProps {
  children?: ReactNode;
}

export const OwnerLayout = ({ children }: OwnerLayoutProps) => {
  return (
    <div className='min-h-screen bg-white p-6 space-y-6'>
      <header className='border-b pb-4'>
        <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
          Owner Layout
        </h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

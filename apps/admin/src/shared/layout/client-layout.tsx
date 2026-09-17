import type { ReactNode } from 'react';

interface ClientLayoutProps {
  children?: ReactNode;
}

export const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <div className='min-h-screen bg-white p-6 space-y-6'>
      <header className='border-b pb-4'>
        <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
          Client Layout
        </h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

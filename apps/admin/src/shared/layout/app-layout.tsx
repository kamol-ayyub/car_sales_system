import type { ReactNode } from 'react';
import { useGetAllQuery } from '@repo/api';
import { meResponseSchema } from '@/shared/schemas/auth.schema';
import { UserRole, type UserDetails } from '@/shared/types/auth-types';
import { AdminShell } from './admin-shell';
import { ClientLayout } from './client-layout';

interface AppLayoutProps {
  children?: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { data, isError } = useGetAllQuery<UserDetails>({
    key: 'user-details',
    url: '/user/me',
    schema: meResponseSchema,
  });

  const user = data?.data;

  if (isError) {
    return (
      <div
        role='alert'
        className='flex min-h-svh items-center justify-center p-6 text-center text-sm text-muted-foreground'
      >
        We couldn't load your account. Please refresh the page.
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex min-h-svh items-center justify-center p-6'>
        <p role='status' className='text-sm text-muted-foreground'>
          Loading your workspace…
        </p>
      </div>
    );
  }

  const isClientOnly =
    user.roles.includes(UserRole.Client) &&
    !user.roles.includes(UserRole.SalesPerson) &&
    !user.roles.includes(UserRole.Owner);

  if (isClientOnly) {
    return <ClientLayout>{children}</ClientLayout>;
  }

  return <AdminShell user={user}>{children}</AdminShell>;
};

import type { ReactNode } from 'react';
import { UserRole, type UserDetails } from '@/shared/types/auth-types';
import { OwnerLayout } from './owner-layout';
import { SalesLayout } from './sales-layout';
import { ClientLayout } from './client-layout';
import { useGetAllQuery } from '@repo/api';
import { meResponseSchema } from '@/shared/schemas/auth.schema';

interface AppLayoutProps {
  children?: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { data } = useGetAllQuery<UserDetails>({
    key: 'user-details',
    url: '/user/me',
    schema: meResponseSchema,
  });

  const roles = data?.data?.roles ?? [];

  if (roles.includes(UserRole.SalesPerson)) {
    return <SalesLayout>{children}</SalesLayout>;
  }

  if (roles.includes(UserRole.Client)) {
    return <ClientLayout>{children}</ClientLayout>;
  }

  return <OwnerLayout>{children}</OwnerLayout>;
};

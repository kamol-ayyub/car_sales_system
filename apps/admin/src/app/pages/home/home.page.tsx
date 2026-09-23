import { useGetAllQuery } from '@repo/api';
import { OwnerDashboard, SalespersonDashboard } from '@/features/dashboard';
import { meResponseSchema } from '@/shared/schemas/auth.schema';
import { UserRole, type UserDetails } from '@/shared/types/auth-types';

export const HomePage = () => {
  const { data, isError } = useGetAllQuery<UserDetails>({
    key: 'user-details',
    url: '/user/me',
    schema: meResponseSchema,
  });

  const user = data?.data;

  if (isError) {
    return (
      <p role='alert' className='text-sm text-muted-foreground'>
        We couldn't load your account. Please refresh the page.
      </p>
    );
  }

  if (!user) {
    return (
      <p role='status' className='text-sm text-muted-foreground'>
        Loading your dashboard…
      </p>
    );
  }

  const isSalesPersonView =
    user.roles.includes(UserRole.SalesPerson) &&
    !user.roles.includes(UserRole.Owner);

  if (isSalesPersonView) {
    return <SalespersonDashboard user={user} />;
  }

  if (user.roles.includes(UserRole.Owner)) {
    return <OwnerDashboard />;
  }

  return null;
};

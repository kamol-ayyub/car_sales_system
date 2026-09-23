import { UserRole } from '@/shared/types/auth-types';

export const salespersonRoleLabels: Record<UserRole, string> = {
  [UserRole.Owner]: 'Owner',
  [UserRole.SalesPerson]: 'Salesperson',
  [UserRole.Client]: 'Client',
};

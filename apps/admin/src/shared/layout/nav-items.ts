import type { ComponentType } from 'react';
import {
  CarIcon,
  ContactIcon,
  LayoutDashboardIcon,
  ReceiptIcon,
  SettingsIcon,
  TrendingUpIcon,
  UsersIcon,
} from 'lucide-react';
import { UserRole } from '@/shared/types/auth-types';

export type NavPath =
  | '/home'
  | '/inventory'
  | '/sales'
  | '/salespeople'
  | '/customers'
  | '/reports'
  | '/settings';

export interface NavItem {
  to: NavPath;
  label: string;
  salesPersonLabel?: string;
  icon: ComponentType<{ className?: string }>;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  {
    to: '/home',
    label: 'Dashboard',
    icon: LayoutDashboardIcon,
    roles: [UserRole.Owner, UserRole.SalesPerson, UserRole.Client],
  },
  {
    to: '/inventory',
    label: 'Inventory',
    icon: CarIcon,
    roles: [UserRole.Owner, UserRole.SalesPerson],
  },
  {
    to: '/sales',
    label: 'Sales',
    salesPersonLabel: 'My Sales',
    icon: ReceiptIcon,
    roles: [UserRole.Owner, UserRole.SalesPerson],
  },
  {
    to: '/salespeople',
    label: 'Salespeople',
    icon: UsersIcon,
    roles: [UserRole.Owner],
  },
  {
    to: '/customers',
    label: 'Customers',
    icon: ContactIcon,
    roles: [UserRole.Owner, UserRole.SalesPerson],
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: TrendingUpIcon,
    roles: [UserRole.Owner],
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: SettingsIcon,
    roles: [UserRole.Owner, UserRole.SalesPerson, UserRole.Client],
  },
];

export const getNavItemsForRoles = (roles: UserRole[]): NavItem[] => {
  const isSalesPersonView =
    roles.includes(UserRole.SalesPerson) && !roles.includes(UserRole.Owner);

  return navItems
    .filter((item) => item.roles.some((role) => roles.includes(role)))
    .map((item) => ({
      ...item,
      label:
        isSalesPersonView && item.salesPersonLabel
          ? item.salesPersonLabel
          : item.label,
    }));
};

import type { MeResponse } from '@/shared/schemas/auth.schema';

export const UserRole = {
  Owner: 'owner',
  SalesPerson: 'sales_person',
  Client: 'client',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export type UserDetails = MeResponse;

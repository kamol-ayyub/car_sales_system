export const UserRole = {
  Owner: 'owner',
  SalesPerson: 'sales_person',
  Client: 'client',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface UserDetails {
  id: string;
  name: string;
  email: string | null;
  phone?: string | null;
  roles: UserRole[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
}

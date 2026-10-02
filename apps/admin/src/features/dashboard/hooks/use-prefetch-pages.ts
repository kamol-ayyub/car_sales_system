import { useEffect } from 'react';
import { prefetchGetQuery } from '@repo/api';
import { router } from '@/app/routes';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { carListSchema, type PaginatedCars } from '@/shared/schemas/car.schema';
import {
  userListSchema,
  type PaginatedUsers,
} from '@/shared/schemas/user.schema';
import { UserRole, type UserDetails } from '@/shared/types/auth-types';

const PREFETCHED_ROUTE_PATHS = [
  '/inventory',
  '/sales',
  '/customers',
  '/settings',
] as const;

const OWNER_ONLY_ROUTE_PATHS = ['/salespeople', '/reports'] as const;

export const usePrefetchPages = (user: UserDetails | undefined) => {
  useEffect(() => {
    if (!user) {
      return;
    }

    const roles = user.roles;
    const isOwner = roles.includes(UserRole.Owner);
    const isSalesPerson = roles.includes(UserRole.SalesPerson);

    if (!isOwner && !isSalesPerson) {
      return;
    }

    for (const path of PREFETCHED_ROUTE_PATHS) {
      router.preloadRoute({ to: path }).catch(() => undefined);
    }
    if (isOwner) {
      for (const path of OWNER_ONLY_ROUTE_PATHS) {
        router.preloadRoute({ to: path }).catch(() => undefined);
      }
    }

    prefetchGetQuery<PaginatedCars>({
      key: QUERY_KEYS.cars,
      url: '/car',
      params: { page: 1, limit: 10 },
      schema: carListSchema,
    });

    prefetchGetQuery<PaginatedCars>({
      key: QUERY_KEYS.sales,
      url: '/sales',
      params: { page: 1, limit: 10 },
      schema: carListSchema,
    });

    prefetchGetQuery<PaginatedUsers>({
      key: QUERY_KEYS.clients,
      url: '/user/clients',
      params: { page: 1, limit: 10 },
      schema: userListSchema,
    });

    if (isOwner) {
      prefetchGetQuery<PaginatedUsers>({
        key: QUERY_KEYS.salespeople,
        url: '/user',
        params: { role: UserRole.SalesPerson, page: 1, limit: 10 },
        schema: userListSchema,
      });
    }
  }, [user]);
};

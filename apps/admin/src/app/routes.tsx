import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import {
  LoginPage,
  NotFoundPage,
  UnauthorizedPage,
} from '@/app/pages';
import { queryClient, validateResponse } from '@repo/api';
import { axiosInstance } from '@/config/axios-config';
import { meResponseSchema } from '@/shared/schemas/auth.schema';
import { AppLayout } from '@/shared/layout/app-layout';
import { RouteErrorFallback } from '@/shared/layout/components';
import { UserRole, type UserDetails } from '@/shared/types/auth-types';
import type { AxiosResponse } from 'axios';

const HomePage = lazyRouteComponent(
  () => import('@/app/pages/home/home.page'),
  'HomePage',
);
const InventoryPage = lazyRouteComponent(
  () => import('@/app/pages/inventory/inventory.page'),
  'InventoryPage',
);
const SalesPage = lazyRouteComponent(
  () => import('@/app/pages/sales/sales.page'),
  'SalesPage',
);
const CustomersPage = lazyRouteComponent(
  () => import('@/app/pages/customers/customers.page'),
  'CustomersPage',
);
const SettingsPage = lazyRouteComponent(
  () => import('@/app/pages/settings/settings.page'),
  'SettingsPage',
);
const SalespeoplePage = lazyRouteComponent(
  () => import('@/app/pages/salespeople/salespeople.page'),
  'SalespeoplePage',
);
const ReportsPage = lazyRouteComponent(
  () => import('@/app/pages/reports/reports.page'),
  'ReportsPage',
);

async function requireRole(role: UserRole | UserRole[]) {
  let userDetails: UserDetails;
  try {
    const response = await queryClient.fetchQuery<AxiosResponse<UserDetails>>({
      queryKey: ['user-details'],
      queryFn: async () => {
        const res = await axiosInstance.get<UserDetails>('/user/me');
        return validateResponse(res, meResponseSchema, '/user/me');
      },
    });
    userDetails = response.data;
  } catch {
    throw redirect({ to: '/login' });
  }

  const allowedRoles = Array.isArray(role) ? role : [role];
  const userRoles = userDetails?.roles ?? [];

  const hasAccess = userRoles.some((userRole) =>
    allowedRoles.includes(userRole),
  );
  if (!hasAccess) {
    throw redirect({ to: '/unauthorized' });
  }
}

export const rootRoute = createRootRoute({
  notFoundComponent: NotFoundPage,
  component: () => <Outlet />,
});

export const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  notFoundComponent: NotFoundPage,
  errorComponent: RouteErrorFallback,
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

export const authenticatedGuard = createRoute({
  getParentRoute: () => layoutRoute,
  id: 'authenticated-route',
  notFoundComponent: NotFoundPage,
  onError: () => {
    router.navigate({ to: '/login' });
  },
  async beforeLoad() {
    await requireRole([UserRole.Owner, UserRole.SalesPerson, UserRole.Client]);
  },
});

export const ownerGuard = createRoute({
  getParentRoute: () => layoutRoute,
  id: 'owner-route',
  notFoundComponent: NotFoundPage,
  onError: () => {
    router.navigate({ to: '/login' });
  },
  async beforeLoad() {
    await requireRole(UserRole.Owner);
  },
});

export const salesPersonGuard = createRoute({
  getParentRoute: () => layoutRoute,
  id: 'sales-person-route',
  notFoundComponent: NotFoundPage,
  onError: () => {
    router.navigate({ to: '/login' });
  },
  async beforeLoad() {
    await requireRole([UserRole.Owner, UserRole.SalesPerson]);
  },
});

export const clientGuard = createRoute({
  getParentRoute: () => layoutRoute,
  id: 'client-route',
  notFoundComponent: NotFoundPage,
  onError: () => {
    router.navigate({ to: '/login' });
  },
  async beforeLoad() {
    await requireRole(UserRole.Client);
  },
});

export const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  beforeLoad: () => redirect({ to: '/home' }),
});

export const unauthorizedRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/unauthorized',
  component: UnauthorizedPage,
});

export const homeRoute = createRoute({
  getParentRoute: () => authenticatedGuard,
  path: '/home',
  component: HomePage,
});

export const inventoryRoute = createRoute({
  getParentRoute: () => salesPersonGuard,
  path: '/inventory',
  component: InventoryPage,
});

export const salesRoute = createRoute({
  getParentRoute: () => salesPersonGuard,
  path: '/sales',
  component: SalesPage,
});

export const customersRoute = createRoute({
  getParentRoute: () => salesPersonGuard,
  path: '/customers',
  component: CustomersPage,
});

export const settingsRoute = createRoute({
  getParentRoute: () => authenticatedGuard,
  path: '/settings',
  component: SettingsPage,
});

export const salespeopleRoute = createRoute({
  getParentRoute: () => ownerGuard,
  path: '/salespeople',
  component: SalespeoplePage,
});

export const reportsRoute = createRoute({
  getParentRoute: () => ownerGuard,
  path: '/reports',
  component: ReportsPage,
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    unauthorizedRoute,
    authenticatedGuard.addChildren([homeRoute, settingsRoute]),
    salesPersonGuard.addChildren([
      inventoryRoute,
      salesRoute,
      customersRoute,
    ]),
    ownerGuard.addChildren([salespeopleRoute, reportsRoute]),
    clientGuard.addChildren([]),
  ]),
  loginRoute,
]);

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const router = createRouter({ routeTree });

export { homeRoute as dashboardRoute };

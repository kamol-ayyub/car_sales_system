# AGENTS.md

This file provides guidance for AI coding agents when working with code in this repository.

## Repository Overview

This project is a Turborepo monorepo using pnpm workspaces for a Car Sales System:

- `apps/server` — NestJS REST API with PostgreSQL, TypeORM, and Joi validation
- `apps/admin` — React 19 internal dashboard built with Vite, TanStack Router, TanStack Query, Tailwind CSS, and shadcn/ui
- `apps/web` — Public-facing client application built with Next.js, Tailwind CSS, and shadcn/ui
- `packages/ui` — Shared shadcn/ui component library shared between `admin` and `web` apps
- `packages/api` — Shared API client and TanStack Query hooks package (`@repo/api`) shared between `admin` and `web` apps

## Monorepo Layout

```
apps/
  server/                    # NestJS API (PostgreSQL via docker-compose)
  admin/                     # Vite + React 19 dashboard app
  web/                       # Next.js public client-facing app
packages/
  ui/                        # Shared shadcn/ui components for admin and web apps
  api/                       # Shared TanStack Query hooks and Axios client (@repo/api)
```

## Commands

### Monorepo (Root)

```sh
pnpm dev            # Start all apps in dev mode via Turborepo
pnpm build          # Build all apps via Turborepo
pnpm lint           # Lint all apps via Turborepo
pnpm test           # Run tests across all apps via Turborepo
pnpm run format     # Format code with Prettier
```

- Use `pnpm` only — never npm or yarn.

### Admin Dashboard (`apps/admin`)

```sh
pnpm --filter admin dev         # Start Vite dev server (http://localhost:5173)
pnpm --filter admin build       # TypeScript compile + Vite production build
pnpm --filter admin lint        # Run linter (oxlint / eslint)
pnpm --filter admin test        # Vitest unit tests
pnpm --filter admin test:e2e    # Playwright E2E tests
```

- E2E test filenames must contain `.e2e.spec.ts`; Vitest excludes them automatically.

### Public Web App (`apps/web`)

```sh
pnpm --filter web dev      # Start Next.js dev server
pnpm --filter web build    # Next.js production build
pnpm --filter web lint     # Lint public web app
```

### Server (`apps/server`)

```sh
pnpm --filter server dev      # Start NestJS in watch mode
pnpm --filter server build    # Build NestJS app and resolve aliases
pnpm --filter server lint     # Lint server code with ESLint
pnpm --filter server test     # Run unit tests (Jest)
pnpm --filter server test:e2e # Run E2E tests (Jest)
pnpm --filter server seed     # Run database seed
```

## E2E testing guidelines

- E2E tests cover user flows, actions, and navigations only — not page structure.
- Do NOT assert that specific texts, inputs, labels, or elements exist on a page; if an expected element is missing, the action that depends on it will fail naturally.
- Test what the user does (click, fill, navigate, submit) and what outcome they observe (redirect, success message, data change) — not what the page contains.

## Architecture

### Shared UI Package (`packages/ui`)

- UI components use **shadcn/ui** built on top of Radix UI primitives and Tailwind CSS.
- shadcn/ui components reside in `packages/ui` and are imported into both `apps/admin` and `apps/web`.
- Do not duplicate UI primitives across applications; place common inputs, buttons, dialogs, dropdowns, and tables in the shared UI package.

### Shared API Package (`packages/api`)

- Server communication logic is housed in `@repo/api` (`packages/api`), shared by both `apps/admin` and `apps/web`.
- Exports configured Axios instance (`axiosInstance`, `axiosConfig`), TanStack Query generic hooks, and query client setup.
- Uses Joi (`validateResponse`) for response validation.

### API hooks

All server communication uses five generic hooks provided by `@repo/api` (imported directly into `apps/admin` and `apps/web`):

- `useGetAllQuery(key, url, params?)` — wraps `useQuery`; cache key is `[key, params]`
- `usePostQuery(url, invalidateKey?, options?)` — wraps `useMutation`; exposes `mutate` (single) and `mutateMany` (batch); invalidates cache on success
- `usePutQuery` / `usePatchQuery` — same pattern for PUT/PATCH
- `useDeleteQuery` — same pattern for DELETE; accepts custom `onSuccess`/`onError`

Components call these hooks directly from `@repo/api` — no separate service layer or duplicate local hooks exist.

### REST API

The backend is a NestJS REST API (`apps/server`). Endpoints follow standard REST conventions (`/auth`, `/car`, `/user`). Query parameters for filtering, search, and pagination are passed directly to `useGetAllQuery`.

### Validation

- Use **Joi** for data validation across the system (already installed in `apps/server`).
- In frontends, form and input validation schemas use Joi (e.g., via `@hookform/resolvers/joi` with React Hook Form) to ensure validation rules stay consistent with server schemas.
- Avoid introducing additional validation libraries like Zod.

### Auth

JWT authentication is used. The access token lives in `localStorage`. The Axios instance (`axiosInstance` configured in `apps/admin/src/config/axios-config.ts`) attaches the Bearer token and redirects to `/login` on 401 responses. Roles are `owner`, `sales_person`, and `client`. Redux is NOT used — do not install or use Redux. Client auth state (if needed) lives in React context or local state. Everything else is React Query.

### Routing

- `apps/admin/src/app/routes.tsx` defines all dashboard routes using TanStack Router with role guards: `ownerGuard` (Owner only), `salesPersonGuard` (Sales Person or Owner), and `clientGuard` (Client). Search params are validated with Joi schemas.
- `apps/web` uses the Next.js App Router for public-facing catalog and vehicle browsing pages.
- Page components in `apps/admin/src/app/pages/` are thin shells — feature components own the logic.

### Path alias

- In `apps/admin`: `@/` resolves to `apps/admin/src/`. Use it for all non-relative imports in dashboard frontend.
- In `apps/web`: `@/` resolves to `apps/web/src/`. Use it for all non-relative imports in public web app.
- In `apps/server`: `@/` resolves to `apps/server/src/`. Use it for all non-relative imports in backend.
- Shared packages: imported via workspace names (e.g., `@repo/ui` or relative package paths).

## Design principles

- Don't overengineer: readability beats cleverness and overoptimization
- Consistency across codebase: if there is an existing pattern, follow it even if an alternative seems marginally better.
- Clear separation of concerns
- Design for scalability and maintainability: avoid premature performance optimizations.
- When multiple valid solutions exist, choose the simplest one

## Code quality and structure

- Small and focused functions (single responsibility)
- Avoid deep nesting
- Clear naming over short naming
- One concept per file/module

## Naming conventions

- Kebab-case for file names
- PascalCase for component names
- camelCase for variable and function names

## Comments & Documentation

- Comment only non-obvious decisions
- Comments should explain "why", not "what"

## Error handling & validation

- Handle errors explicitly; never silently ignore failures
- Validate external input at system boundaries (API, forms, webhooks) using Joi schemas
- Do not catch errors unless they can be meaningfully handled
- Error messages should include enough context to debug
- Do not use try/catch unless you know exactly what exception you are handling

## Other do's

- Use shadcn/ui components from the shared UI package (`packages/ui`) for both `apps/admin` and `apps/web`
- Use Tailwind CSS for styling, spacing, flex, grid, and layout
- Use React Hook Form with shadcn Form components for all forms
- Use Joi for schema validation
- If unsure, ask before implementing
- State assumptions clearly
- Propose alternatives when trade-offs exist
- Prefer standard library and existing utilities over introducing new abstractions
- Use TanStack Query (react-query) for all server state and API calls
- Every time you complete a task, run:
  - `pnpm lint`
  - `pnpm build`
- Every time you created or changed any UI, use impeccable skill to polish and fix it
- If you used Playwright to test something, or notice leftover Playwright artifacts (e.g. `.playwright-mcp/`, ad-hoc screenshots), remove them once the task is done and before committing changes

## Other dont's

- DO NOT use default exports (except where required by Next.js conventions in `apps/web`) — always use named exports
- DO NOT make improvements or changes unless asked by the user to do so
- DO NOT propose future enhancements unless explicitly asked by the user
- DO NOT critique the implementation or identify problems irrelevant to the current task at hand
- DO NOT introduce new libraries without justification (some operations can be handled by utility functions)
- DO NOT modify unrelated code or files
- DO NOT ever use emojis
- DO NOT use any for types
- DO NOT put your name in commit message ("Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>" etc.)

## Tech Stack

### Monorepo

- Monorepo Tool: Turborepo
- Package Manager: pnpm (workspaces)
- Formatter: Prettier

### Shared Packages

- **`packages/ui`**: Component Library with shadcn/ui (Radix UI + Tailwind CSS), Lucide React (`lucide-react`)
- **`packages/api`**: Shared client library (`@repo/api`) with Axios, TanStack Query (`@tanstack/react-query`), and Joi response validation

### Frontend Dashboard (`apps/admin`)

- Language: TypeScript
- Framework: React 19 + Vite
- Routing: TanStack Router
- Server State: TanStack Query (react-query)
- HTTP Client: Axios
- UI: shadcn/ui (from `packages/ui`)
- Styling: Tailwind CSS
- Forms: React Hook Form + shadcn Form
- Validation: Joi
- State Management: TanStack Query for server state; React Context / useState for client state (no Redux)
- Utilities: lodash-es, date-fns, dayjs
- Linter: Oxlint / ESLint
- Type-checking: TypeScript
- Testing: Vitest (unit), Playwright (e2e)

### Public App (`apps/web`)

- Framework: Next.js (App Router)
- Language: TypeScript
- UI: shadcn/ui (from `packages/ui`)
- Styling: Tailwind CSS
- Validation: Joi
- Server State: TanStack Query (react-query)

### Backend (`apps/server`)

- Language: TypeScript
- Framework: NestJS
- Database: PostgreSQL 16 (docker-compose)
- ORM: TypeORM
- Auth: JWT (Passport / Guards)
- Validation: Joi, class-validator, class-transformer
- Linter: ESLint
- Testing: Jest (unit & e2e)

## Admin Folder Structure

Feature-based architecture inside `apps/admin/src/`. Features are isolated and self-contained but can import from `shared/`.

```
apps/admin/src/
  main.tsx                   # App entry point
  index.css                  # Global styles

  app/                       # App-level setup (not feature-specific)
    routes.tsx               # Route definitions (TanStack Router)
    query-client.ts          # TanStack Query client config
    query-provider.tsx       # TanStack Query provider
    pages/                   # Page-level components wired to routes
      <feature>/
        <feature>.page.tsx

  features/                  # Feature modules (isolated)
    <feature>/
      components/            # UI components scoped to this feature
      hooks/                 # Feature-specific hooks
      schemas/               # Joi schemas for this feature
      types.ts               # Types scoped to this feature

  shared/                    # Cross-feature shared code
    constants/               # App-wide constants
    hooks/                   # Shared custom UI/utility hooks
    layout/                  # App shell, sidebar, header
      components/
    schemas/                 # Shared Joi schemas
    types/                   # Shared TypeScript types
    utils/                   # Shared utility functions

  assets/                    # Static assets (images, svgs)
```

### Rules

- Features must not import from other features directly
- Shared code lives in `shared/` and can be imported by any feature
- Page components in `app/pages/` are thin — they compose feature components
- Each folder with multiple exports should have an `index.ts` barrel file

## Server Folder Structure

NestJS modular architecture inside `apps/server/src/`:

```
apps/server/src/
  main.ts                    # Server entry point
  app.module.ts              # Root application module
  seed.ts                    # Database seed script
  config/                    # Configuration and TypeORM setup
  common/                    # Shared filters, interceptors, dto
  car/                       # Car inventory and sales module
    dto/
    entities/
    car.controller.ts
    car.service.ts
    car.module.ts
  user/                      # User and authentication module
    auth/                    # Login, registration, JWT
    decorators/              # CurrentUserId, Public, Roles
    dto/
    entities/
    user.controller.ts
    user.service.ts
    user.module.ts
```

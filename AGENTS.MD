# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm dev            # start dev server at http://localhost:5173
pnpm build          # TypeScript compile + Vite production build
pnpm test           # Vitest unit tests
pnpm test:e2e       # Playwright E2E tests
pnpm run lint       # ESLint
pnpm run type-check # TypeScript type check (no emit)
pnpm run format     # Prettier
```

- Use `pnpm` only — never npm or yarn.
- E2E test filenames must contain `.e2e.spec.ts`; Vitest excludes them automatically.

## E2E testing guidelines

- E2E tests cover user flows, actions, and navigations only — not page structure.
- Do NOT assert that specific texts, inputs, labels, or elements exist on a page; if an expected element is missing, the action that depends on it will fail naturally.
- Test what the user does (click, fill, navigate, submit) and what outcome they observe (redirect, success message, data change) — not what the page contains.

## Architecture

### API hooks

All server communication uses four generic hooks in `src/shared/hooks/api/`:

- `useGetAllQuery(key, url, params?)` — wraps `useQuery`; cache key is `[key, params]`
- `usePostQuery(url, invalidateKey?, options?)` — wraps `useMutation`; exposes `mutate` (single) and `mutateMany` (batch); invalidates cache on success
- `usePutQuery` / `usePatchQuery` — same pattern for PUT/PATCH
- `useDeleteQuery` — same pattern for DELETE; accepts custom `onSuccess`/`onError`

Components call these hooks directly — no separate service layer exists.

### OData

The backend is OData. Complex `$expand`, `$select`, `$filter`, `$orderby` strings are assembled as named constants in `src/shared/constants/query-params.ts` and passed as `params` to `useGetAllQuery`.

### Auth

Access and refresh tokens live in `localStorage`. The Axios instance (`src/config/axios-config.ts`) silently refreshes on 401: POSTs to `/auth/refresh`, retries the original request, and redirects to `/login` if refresh fails. Auth state (user object, role) lives in Redux (`src/features/auth/store.ts`). Everything else is React Query — Redux is not used for server state.

### Routing

`src/app/routes.tsx` defines all routes with three role guards: `adminGuard` (Admin only), `staffGuard` (Admin or Teacher), `teacherGuard` (Teacher only). Search params are typed with Zod schemas (`tablePaginationSchema`, etc.). Page components in `src/app/pages/` are thin shells — feature components own the logic.

### Path alias

`@/` resolves to `src/`. Use it for all non-relative imports.

### PDF generation

Report cards use `@pdfme`. The template (element positions, fonts, table schemas) is built in `src/features/report-cards/components/report-card-template.ts`. `@pdfme/generator` renders the PDF; `@pdfme/ui` provides the viewer. All coordinates are in millimeters on an A4 page (210 × 297 mm).

## Design principles

- Don't overengineer: readibility beats cleverness and overoptimization
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
- Use `as const` objects instead of enums; use UPPERCASE for keys

## Comments & Documentation

- Comment only non-obvious decisions
- Comments should explain "why", not "what"
- Use comments for section names in JSX/TSX markup

## Error handling & validation

- Handle errors explicitly; never silently ignore failures
- Validate external input at system boundaries (API, forms, webhooks)
- Do not catch errors unless they can be meaningfully handled
- Error messages should include enough context to debug
- Do not use try/catch unless you know exactly what exception you are handling

## Other do's

- You must use ant design components for everything except layout, for layout use tailwind
- If unsure, ask before implementing
- State assumptions clearly
- Propose alternatives when trade-offs exist
- Prefer standard library and existing utilities over introducing new abstractions
- Use Ant Design (antd) for all UI components
- Use Tailwind CSS only for layout (spacing, flex, grid, sizing) and typography — not for styling components
- Do not override Ant Design component colors (buttons, inputs, dropdowns, selects, etc.) — keep default theme colors
- Use Ant Design Form for all forms
- Use TanStack Query (react-query) for all server state and API calls
- Use TanStack Router for routing
- Every time you complete a task, run:
  - `pnpm run type-check`
  - `pnpm run lint`
  - `pnpm run build`
- Every time you created or changed the any UI, use impeccable skill to polish and fix it
- If you used Playwright to test something, or notice leftover Playwright artifacts (e.g. `.playwright-mcp/`, ad-hoc screenshots), remove them once the task is done and before committing changes

## Other dont's

- DO NOT use default exports — always use named exports

- DO NOT make improvements or changes unless asked by the user to do so
- DO NOT propose future enhancements unless explicity asked by the user
- DO NOT critique the implementation or identify problems irrelevant to the current task at hand
- DO NOT introduce new libraries without justification (some operations can be handled by utility functions)
- DO NOT modify unrelated code or files
- DO NOT ever use emojis
- DO NOT use any for types
- DO NOT put your name in commit message ("Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  " etc.)

## Tech Stack

- Language: TypeScript
- Frontend: React 19 + Vite
- Routing: TanStack Router
- Server State: TanStack Query (react-query)
- HTTP Client: Axios
- Validation: Zod
- Forms: Ant Design Form
- State Management: Redux Toolkit (use only if really necessary)
- Styling: Tailwind CSS v4
- UI: Ant Design (antd)
- Icons: @heroicons/react
- Utilities: lodash-es, date-fns, dayjs
- Linter: ESLint
- Type-checking: TypeScript
- Formatter: Prettier
- Testing: Vitest (unit), Playwright (e2e)
- Git hooks: Husky + lint-staged

## Folder structure

Feature-based architecture. The backend lives alongside this frontend at `../Server` (the vendored Candlelight server — see the repo-root `CLAUDE.md`). Features are isolated and self-contained but can import from `shared/`.

```
src/
  main.tsx                   # App entry point
  index.css                  # Global styles

  app/                       # App-level setup (not feature-specific)
    routes.tsx               # Route definitions (TanStack Router)
    store.ts                 # Redux store setup
    query-client.ts          # TanStack Query client config
    query-provider.tsx       # TanStack Query provider
    pages/                   # Page-level components wired to routes
      <feature>/
        <feature>.page.tsx

  features/                  # Feature modules (isolated)
    <feature>/
      components/            # UI components scoped to this feature
      hooks/                 # Feature-specific hooks
      schemas/               # Zod schemas for this feature
      store.ts               # Redux slice (if needed)
      types.ts               # Types scoped to this feature

  shared/                    # Cross-feature shared code
    constants/               # App-wide constants
    hooks/                   # Shared custom hooks (e.g. API hooks)
      api/                   # Generic TanStack Query wrappers
    layout/                  # App shell, sidebar, header
      components/
    schemas/                 # Shared Zod schemas
    types/                   # Shared TypeScript types
    utils/                   # Shared utility functions

  config/                    # Infrastructure config (axios, env, etc.)
  assets/                    # Static assets (images, svgs)
```

### Rules

- Features must not import from other features directly
- Shared code lives in `shared/` and can be imported by any feature
- Page components in `app/pages/` are thin — they compose feature components
- Each folder with multiple exports should have an `index.ts` barrel file

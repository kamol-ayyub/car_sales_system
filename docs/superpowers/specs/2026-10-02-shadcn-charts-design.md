# shadcn Charts for Reports and Dashboards

## Problem

The admin app's data visualizations are hand-rolled CSS `div` bars that look
unpolished and are not real charts:

- `apps/admin/src/features/reports/components/revenue-chart.tsx` — horizontal
  CSS bars for revenue over time.
- `apps/admin/src/features/reports/components/reports-brands-list.tsx` —
  horizontal CSS bars for sales by brand.
- `apps/admin/src/features/dashboard/components/owner-dashboard.tsx` —
  "Available inventory by brand" CSS progress bars.
- `apps/admin/src/features/dashboard/components/salesperson-dashboard.tsx` —
  "Team standing" ranked list.

The app has no charting library installed. shadcn/ui charts are built on
Recharts v3 and fit the existing shadcn component system.

## Goal

Replace all four custom visualizations with real shadcn charts, choosing the
chart type that fits the shape of each dataset:

- Time-series data → **area chart**.
- Categorical comparisons and rankings → **bar chart**.

## Decisions

- **Chart types:** area for revenue over time; horizontal bars for the three
  categorical/ranking datasets.
- **Location of primitives:** the shadcn `chart.tsx` component lives in
  `packages/ui`, consistent with the monorepo rule that shared UI primitives
  live in the shared UI package. Both apps may import it.
- **Dependency:** `recharts@^3` is added to `packages/ui`. Recharts v3 supports
  React 19.

## Design

### 1. Shared chart primitives

- Add `packages/ui/components/chart.tsx` using the shadcn Base UI
  (`base-vega` style) chart component, adapted to import `cn` the same way other
  components in the package do.
- It exports `ChartContainer`, the `ChartConfig` type, `ChartTooltip`,
  `ChartTooltipContent`, `ChartLegend`, and `ChartLegendContent`.
- Add `recharts@^3` to `packages/ui` dependencies.

Consumers build charts with Recharts components (`AreaChart`, `Area`,
`BarChart`, `Bar`, axes, grid) and bring in `ChartContainer` / `ChartTooltip`
for theming and tooltips.

### 2. Color tokens

Add `--chart-1` through `--chart-5` to `packages/ui/styles/globals.css` for both
`:root` and `.dark`. Tokens are defined as complete color values (e.g.
`hsl(...)`) so Recharts can reference `var(--chart-1)` directly. Palette is the
shadcn default restrained set (blue, teal, violet, amber, red) and is
adjustable.

No Tailwind `@theme` mapping is required because chart colors are consumed
through the shadcn chart config, not through utility classes.

### 3. Chart replacements

All four keep their existing `Card` wrappers and `Empty` states. Each
`ChartContainer` has a fixed/min height so `ResponsiveContainer` can measure on
first render.

1. **Revenue over time** (`revenue-chart.tsx`) — gradient area chart.
   - Single `revenue` data key, `type="natural"`, gradient fill and stroke from
     `--chart-1`.
   - `CartesianGrid vertical={false}`; `XAxis dataKey="period"` formatted with
     the existing `formatPeriod` helper; currency formatted in the tooltip.
   - `ChartTooltip` / `ChartTooltipContent`.
   - Periods are pre-mapped to display labels for the x-axis and tooltip.

2. **Sales by brand** (`reports-brands-list.tsx`) — horizontal bar chart.
   - `BarChart layout="vertical"`, `YAxis brand` (category), `XAxis` numeric.
   - `Bar dataKey="revenue"` with rounded corners.
   - Tooltip shows revenue and units sold.

3. **Available inventory by brand** (`owner-dashboard.tsx`) — horizontal bar
   chart.
   - `YAxis brand` (category), `XAxis` numeric, `Bar dataKey="count"`.

4. **Team standing** (`salesperson-dashboard.tsx`) — horizontal bar chart.
   - `YAxis name` (category), `XAxis` numeric, `Bar dataKey="count"`.
   - The current user's bar is highlighted with `Cell` using `--chart-2`; the
     existing rank line ("Rank #n of m") is kept.

### 4. Data

No backend changes. All required data already exists in the API responses:

- Reports: `revenueOverTime` (`period`, `revenue`, `units`), `brands`
  (`brand`, `units`, `revenue`).
- Owner dashboard: `topBrands` (`brand`, `count`).
- Salesperson dashboard: standings computed client-side from the car list.

## Files

**Add**

- `packages/ui/components/chart.tsx`

**Modify**

- `packages/ui/package.json` — add `recharts`
- `packages/ui/styles/globals.css` — add `--chart-*` tokens
- `apps/admin/src/features/reports/components/revenue-chart.tsx`
- `apps/admin/src/features/reports/components/reports-brands-list.tsx`
- `apps/admin/src/features/dashboard/components/owner-dashboard.tsx`
- `apps/admin/src/features/dashboard/components/salesperson-dashboard.tsx`

## Verification

- `pnpm lint` and `pnpm build` from the repo root.
- Visual check in the admin dev server for all four charts, including empty
  states and day/week/month report groupings.
- Run the `impeccable` skill to polish the new UI (per AGENTS.md).

## Out of scope

- Backend changes.
- New analytics endpoints or additional metrics.
- Charts in the public `apps/web`.

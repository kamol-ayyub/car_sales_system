---
target: new shadcn charts (reports + dashboards)
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
p2_count: 2
target_identity: "file:/home/ayyub/Desktop/car_sales_system/apps/admin/src/features/reports/components/revenue-chart.tsx"
target_fingerprint: "sha256:81e9d8ab375fbe646804ed13ccb78efa406aefac6e20f394d93df8ee1de14c5b"
target_path: /home/ayyub/Desktop/car_sales_system/apps/admin/src/features/reports/components/revenue-chart.tsx
timestamp: 2026-10-02T15-26-25Z
slug: ures-reports-components-revenue-chart-tsx-6c91d27e
---
# Impeccable Critique — shadcn charts (reports + dashboards)

Method: dual-agent (A: design review · B: detector + manual evidence). Browser visualization unavailable in this session (no browser tool), so findings are source-based; no overlay was produced.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeletons/retry/empty states exist; active period not restated by charts; refetch not announced to AT |
| 2 | Match System / Real World | 3 | Plain labels undermined by placeholder "Est. commission" shown as real |
| 3 | User Control and Freedom | 3 | Period presets/custom reversible; no chart drill-down/export |
| 4 | Consistency and Standards | 2 | Heading semantics differed across identical cards; truncation duplicated; legend hardcoded a token |
| 5 | Error Prevention | 2 | Date range guarded; `/car?limit=100` truncates data silently; placeholder commission actionable |
| 6 | Recognition Rather Than Recall | 3 | Axis/tooltip/legend present; truncated ticks only recoverable on hover |
| 7 | Flexibility and Efficiency | 2 | accessibilityLayer keyboard nav; no comparison/export/top-N |
| 8 | Aesthetic and Minimalist Design | 3 | Clean and quiet; grayscale flat; near-white dark area fill loud |
| 9 | Error Recovery | 3 | DataErrorState + inline date error; chart-level failure uncovered |
| 10 | Help and Documentation | 1 | No contextual help for commission math, ranking, period semantics |
| **Total** | | **25/40** | **Acceptable (62.5%)** |

## Design Specificity Verdict

Category-interchangeable. Canonical shadcn/Recharts recipe with product nouns substituted; little dealership domain encoding beyond labels. On-brand in tone (restrained, no gradients/glass) but not authored for this product. Palette is five grayscale steps, so color carries no series meaning.

## Overall Impression

A solid, restrained first chart pass that fits the monochrome brand and ships real empty/error states. The largest opportunity is turning generic analytics into dealership-specific signal (gross per unit, ageing, velocity) and making the data trustworthy.

## What's Working

1. Centralized theming via `ChartContainer` + `--chart-*` tokens (light/dark wired).
2. Accessible scaffolding where easy to forget: `accessibilityLayer`, `sr-only` table caption, heading roles on report cards, explanatory empty states.
3. Numeric care: compact currency on axes, full currency in tooltips, tabular-nums, `allowDecimals={false}`.

## Priority Issues

- **[P0] Salesperson stats computed from a truncated page.** `/car?limit=100` then client-side aggregation -> wrong revenue/commission/rank beyond 100 cars. Fix: server-side salesperson dashboard endpoint. NOT fixed (backend scope).
- **[P1] Team standing could exclude the user while the legend still showed "You".** FIXED: current user is now always included in the plotted set; legend matches.
- **[P1] Placeholder 3% commission shown as an authoritative metric.** NOT fixed (needs business decision): hide until a real rate exists.
- **[P1] Natural spline distorted the revenue trend.** FIXED: switched to `monotone`.
- **[P2] Inverted emphasis + empty color semantics.** FIXED: focal "You" bar is now `--chart-1` (near-black), context bars `--chart-2`; shared `truncateLabel` util removes duplication; heading roles unified; area tooltip cursor restored for precision.
- **[P2] Axis tick contrast ~4.7:1** (muted-foreground) passes AA but misses the product's 7:1 label target. OPEN: decide whether to darken chart tick token.

## Persona Red Flags

- **Alex (power user):** no period comparison, export, sort/filter, or drill-down; 6-button period picker with no shortcut.
- **Sam (accessibility):** heading outline previously differed between reports and dashboards (fixed); no data-table fallback for the area trend; tick contrast below the product's 7:1 aim.
- **Riley (edge cases):** "All time" groups by day with no downsampling; brand names silently lose their tail on the axis; >100-car truncation.

## Minor Observations

- `initialDimension` 320x200 causes a small CLS before measurement.
- Salespeople/top-clients tables unbounded; brand chart capped at `max-h-96` with no scroll affordance.
- Empty-state copy tone varies slightly across cards.

## Questions to Consider

1. What would a dealership revenue chart show that a generic area chart cannot (gross per unit, days-on-lot, velocity)?
2. Should every series be one warm accent against neutral rather than five grays?
3. Should a salesperson's home screen end on a competitive leaderboard, or on their own next sale and a truthful number?

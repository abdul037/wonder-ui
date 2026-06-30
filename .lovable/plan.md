## Phase 5 — Dashboard UI Polish & Workstream Clarity

### 1. Workstream naming (full names everywhere)
Update the workstream registry in `src/data/projects.ts` so each code maps to its official long name:
- **OX** — Operation Excellence
- **DW** — Data Warehouse / PowerBI
- **EX** — Employee Experience
- **AU** — Asset Utilization

Cascade these names through the Dashboard, Portfolio, Sprint Board, Roadmap, Newsletter, and Admin pages (badges show short code, tooltips/labels show full name).

### 2. Clarify the "Avg Progress" metric
Today the dashboard shows "Avg Progress %" with no explanation. It is the **mean of each project's `progress` field within the selected workstream filter** (simple average, not weighted).

Two improvements:
- **Rename + tooltip**: relabel to "Avg Project Completion" with an info-icon tooltip explaining "Mean of progress across all projects in scope. Each project counted equally."
- **Optional toggle**: small segmented control to switch between *Simple Avg* and *Weighted by # of actions* so executives can see both views.

### 3. Dashboard UI enhancement (apply Design4 reference)
Rework `src/routes/index.tsx` to match the strategic-report aesthetic from the shared design file:

```text
┌──────────────────────────────────────────────────────────┐
│ Hero strip: greeting + scope filter + last-refresh chip  │
├──────────────────────────────────────────────────────────┤
│ Bento KPI grid (6 tiles, asymmetric, large numerals)     │
│  ┌──────────┬───────┬───────┐                            │
│  │ Major    │ Open  │ Done  │                            │
│  │ Projects │ Acts  │ Acts  │                            │
│  ├──────────┼───────┼───────┤                            │
│  │ In Prog  │ High  │ Block │                            │
│  └──────────┴───────┴───────┘                            │
├────────────────────────┬─────────────────────────────────┤
│ Portfolio Health bar   │ Workstream Performance          │
│ + status legend        │ (full names, progress rails,    │
│                        │  delta vs last week)            │
├────────────────────────┼─────────────────────────────────┤
│ Live Actions Feed      │ Owner Workload leaderboard      │
├────────────────────────┴─────────────────────────────────┤
│ Critical Blockers panel (red rail, CTA to portfolio)     │
├──────────────────────────────────────────────────────────┤
│ Upcoming Milestones timeline | SCM Tech Pulse strip      │
└──────────────────────────────────────────────────────────┘
```

Visual upgrades:
- Workstream tiles get the **full name as title**, short code as chip, with a circular progress dial + sparkline-style delta.
- KPI tiles use larger display numerals (JetBrains Mono), micro-trend arrows, and subtle gradient surfaces per status color.
- Portfolio Health bar gets segment labels with counts on hover.
- Live Actions Feed gets workstream rail color + status pill + relative time.
- Critical Blockers card uses an accent border and "days blocked" badge.
- Add a small "How metrics are computed" popover anchored at the top-right.

### 4. Files touched
- `src/data/projects.ts` — add `workstreamFullName` map / update existing meta.
- `src/routes/index.tsx` — restructure KPIs, add tooltip + toggle, polish panels.
- `src/components/AppShell.tsx` — sidebar shows full workstream names.
- `src/styles.css` — bento grid utilities, dial styles, tooltip token.
- (Optional) small `WorkstreamBadge` component for consistent code+name rendering.

### Out of scope
No data model or business-logic changes beyond the avg-progress toggle. Other routes only get the workstream rename pass.

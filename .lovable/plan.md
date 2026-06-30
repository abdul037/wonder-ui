## Dashboard Redesign (match attached reference)

Rework `src/routes/index.tsx` so the dashboard mirrors the reference screenshot's layout and visual language, while keeping our Supply Chain Tech Hub data model and workstreams (OX, EX, AU, DW with full names).

### 1. Header row
- Title "Executive Overview" + subtitle "Real-time performance metrics across strategic workstreams."
- Right side: segmented control with Daily / Weekly / Monthly tabs (visual only, Daily active).

### 2. KPI strip — 6 white cards in one row
Each card: small uppercase label, large numeric value, and a tiny visual flourish (sparkline / bars / zigzag / progress sliver). Cards, in order:
1. Total Major Projects — count of all projects (faint sine sparkline).
2. Total Actions — sum of tasks across projects (rising line).
3. In Current Sprint — actions whose status is "In Progress" (mini bar trio).
4. Open Blockers — Blocked projects + tasks; red left border + red zigzag; "+N this week" caption.
5. High Priority — High priority tasks; orange numeric + thin orange progress sliver.
6. Avg. Delivery — placeholder static "14d" with "Efficiency 92% Q4 Target" caption (no % calc beyond this label).

All sparkline visuals are pure inline SVG; no chart lib, no real progress percentages elsewhere.

### 3. Portfolio Distribution filter row
- Section title "Portfolio Distribution" + "Advanced Filters" link on the right.
- Pill chips: All Workstreams (active, indigo filled), Operation Excellence (OX), Employee Experience (EX), Asset Utilization (AU), Data Warehouse / PowerBI (DW). Each chip shows a colored dot + name + count badge.

### 4. Project cards grid (3 columns)
For each project in scope, render a card with:
- Two top tags: `WORKSTREAM: <code>` (workstream color) + priority badge.
- Title (project name) + 2-line description.
- Phase label + status pill (e.g. "Development Progress", "UAT Testing", "Discovery Phase") — derived from project status, NO % bar (replaced with a thin status-color accent line per our prior "remove progress" rule).
- Footer row: stacked owner avatars (initials bubbles) + a meta chip (sprint tag / days-left / workstream tag).
- Bottom strip: small tech icons (Material Symbols) on the left, "View Details" button linking to `/portfolio/$projectId` on the right.

### 5. Bottom row (matches reference's partial cards)
- Left/middle: continuation of project cards (Global Expansion etc.) + a "Key Milestones" card listing upcoming milestones with check icons.
- Right: red-tinted "Critical Blockers" card listing blocked items.

### 6. Visual system
- Background: light surface; cards: white with subtle border + soft shadow on hover.
- Keep semantic tokens from `src/styles.css` (workstream-ox/ex/au/dw, status-*). No hardcoded hex.
- Replace prior "Workstream Status Breakdown / Owner Workload / Action Status Mix" sections with this reference layout. Per existing memory rule, no percentage progress bars — phase rows use status pills instead of filled `%` bars.

### Files touched
- `src/routes/index.tsx` — full rewrite of the Dashboard component.
- `src/styles.css` — only if a new utility (e.g. `.kpi-card`) is needed; otherwise untouched.

No data model, routing, or other page changes.
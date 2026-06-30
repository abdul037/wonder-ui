# UI Audit & Enhancement Plan

## Findings (per page)

**Dashboard (`/`)** — 897 lines, dense. KPI strip wraps awkwardly < 1400px; Action Category chip rows overflow; project cards use mixed font sizes (text-[10px] up to text-2xl); some count chips lose contrast on hover.

**Portfolio (`/portfolio`)** — Grid cards stretch unevenly (no min-h, tag pills wrap to 3 lines); List view row height inconsistent; tech/business owner avatars missing fallback when no URL.

**Pipeline (`/pipeline`)** — Kanban columns don't equalize height; effort/priority badges duplicate workstream color; "Promote" CTA has no hover affordance; empty columns collapse with no placeholder.

**Sprint Board (`/sprint-board`)** — 7 columns force horizontal scroll on laptop; column headers truncate; cards lack consistent padding; assignee row overflows.

**Roadmap (`/roadmap`) + Unified Roadmap** — Legacy `/roadmap` is now redundant (Unified Roadmap is the canonical version). Gantt bars on `/roadmap` misalign at narrow widths.

**Newsletter (`/newsletter`)** — Bento tiles have inconsistent radii and gap; "Strategic Impact" hero text too large (text-4xl) vs body cards; CTA buttons not full-width on mobile.

**Import Data (`/import`)** — Currently a standalone route; duplicates upload/CSV affordances that belong with other admin operations.

**Global** — Inter loaded but headings use font-black at oversized sizes (text-2xl/3xl) in many cards causing visual noise; no consistent type scale; some text-[10px] is below readable threshold.

## Plan

### 1. Typography system (src/styles.css + components)
Introduce a tight, consistent scale and reduce heading weight:
- Display: `text-2xl font-bold tracking-tight` (page titles)
- H2 (section): `text-base font-semibold`
- H3 (card title): `text-sm font-semibold`
- Body: `text-sm` / Body-sm: `text-xs`
- Eyebrow/Label: `text-[11px] uppercase tracking-wider font-medium` (replace all `text-[10px]`)
- Numeric KPI: `text-3xl font-bold tabular-nums` (cap, not text-4xl/5xl)
Add utility classes `.eyebrow`, `.kpi-num`, `.card-title`, `.card-meta` so future cards stay consistent. Tighten line-heights via `leading-snug` defaults.

### 2. Reusable card primitives
Add `src/components/ui/SurfaceCard.tsx` and `StatCard.tsx`:
- Standard padding (`p-4 sm:p-5`), radius (`rounded-xl`), border (`border-border-subtle`), hover (`card-hover-effect`)
- Built-in header/footer slots, optional accent stripe (workstream color)
- `min-h` so grid cards align
Refactor Dashboard project cards, Portfolio cards, Pipeline cards, Newsletter tiles, Sprint cards to use these — eliminates one-off styling drift.

### 3. Page-level fixes
- **Dashboard**: 6-KPI strip → responsive `grid-cols-2 sm:grid-cols-3 xl:grid-cols-6`; Action Category cards equal height; chip rows scroll-x on mobile only; tighten font sizes per scale.
- **Portfolio**: fixed-height cards (`min-h-[220px]`), truncate tags to 3 + "+N"; List rows uniform 56px; avatar fallback initials.
- **Pipeline**: equal-height columns via `grid auto-rows-fr` wrapper for cards, empty-state placeholder, Promote button gets primary-fixed hover.
- **Sprint Board**: convert to horizontally-scrollable rail with sticky column headers; reduce column min-width 280→240; add column-count badges.
- **Newsletter**: normalize bento grid (`auto-rows-[180px]` with span utilities), hero text-2xl, mobile-full CTAs.
- **Roadmap (legacy)**: keep but add banner linking to Unified Roadmap; fix Gantt min-width with overflow-x.

### 4. Fold Import Data into Admin
- Move `/import` content into a new **"Import Data"** tab inside `src/routes/admin.tsx` (alongside Projects/Tasks/Newsletter/Pipeline).
- Remove `/import` from sidebar `navItems` in `AppShell.tsx`.
- Keep `src/routes/import.tsx` as a redirect to `/admin?tab=import` for back-compat.
- Admin gains tabbed query-param state so deep links work.

### 5. Sidebar/topbar polish
- Reduce sidebar item padding `py-3 → py-2.5`, label `text-sm → text-[13px]`.
- Topbar height 16 → 14, search input slightly smaller.
- Brand block: title `text-base` instead of `text-lg`.

## Out of scope
- No data-model changes, no business-logic changes.
- No new pages beyond admin tab additions.
- No theming/branding swap (Gulf Cryo) — that's a separate pass.

## Files touched
`src/styles.css`, `src/components/AppShell.tsx`, `src/components/ui/SurfaceCard.tsx` (new), `src/components/ui/StatCard.tsx` (new), `src/routes/index.tsx`, `src/routes/portfolio.tsx`, `src/routes/pipeline.tsx`, `src/routes/sprint-board.tsx`, `src/routes/newsletter.tsx`, `src/routes/roadmap.tsx`, `src/routes/admin.tsx`, `src/routes/import.tsx`.

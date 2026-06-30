# Plan — UI Polish + Meeting/Briefing Mode

Two parallel tracks: (1) tighten the UI across the 6 surfaces, (2) add a dedicated **Briefing Mode** designed for live presentation to the Head of SCM.

---

## Track 1 — UI Enhancements

### Global (applies everywhere)

- **Typography system** — switch display font to **Space Grotesk** (page titles, KPIs, eyebrows) while keeping **Inter** for body and **JetBrains Mono** for IDs/timestamps. Reduces "generic dashboard" feel.
  - `page-title` 24 → 26px, tighter `-0.02em`
  - `section-title` 15 → 14px, weight 700, uppercase tracking on rails
  - `card-title` 14px, `card-meta` 12px (unchanged)
  - `kpi-num` use Space Grotesk 28px, tabular-nums
- **Spacing rhythm** — standardize to 4/8/12/16/24. Remove the mix of 5/7/11 paddings currently in cards.
- **Card system** — single `<SurfaceCard>` primitive with three densities (compact / default / hero). Removes 6 slightly different card styles in use today.
- **Status chips** — unify into one `<StatusPill tone size>` component. Today three variants exist across dashboard / portfolio / sprint board.
- **Workstream accent bar** — 3px left bar on every project card (OX blue, DW indigo, EX violet, AU emerald) for instant scan.
- **Empty + loading states** — skeleton shimmer instead of "—" blanks.

### Per-screen

| Screen | Improvements |
|---|---|
| **Dashboard** | Collapse the 6 KPI tiles into a 1-row sparkline strip with hover detail. Move "Action Categories" filter cards into a sticky left rail so the project grid uses full width. Tighten Live Actions feed to 32px row height with timeline gutter. |
| **Portfolio** | Make project rows feel like a data grid (zebra, sticky header, column resizer). Replace the chevron with a row-click drilldown; show a side panel instead of an inline accordion for cleaner scanning of tasks. Filter chips collapse into a single "Filter" button with active-count badge. |
| **Pipeline** | Tighten Kanban cards (remove redundant labels), color the column header strip by stage, add stage WIP counts. Add drag-and-drop between stages (Admin mode). |
| **Sprint Board** | Reduce the 7 columns to a horizontally scrollable rail with sticky column headers, swimlane toggle (by workstream / by owner). Task card shows priority dot + age in days. |
| **Period Roadmap** | Convert the quarterly grid to a true horizontal timeline (Q-bands across the top, workstream rows down). Today/now line. Hero project pinned. |
| **Tech Pulse** | Magazine layout: 1 hero story + 2 secondary + scrollable digest. Add reading-time + workstream tag. Bigger imagery placeholder area. |

---

## Track 2 — Briefing Mode (Meeting View for Head of SCM)

A new dedicated route `/briefing` (also reachable via a "Present" button in the top bar) that turns the data into a guided slideshow.

### Concept

Not another dashboard. A **deck**, rendered live from the same store, that you walk the Head of SCM through in 8–12 minutes.

### Structure (10 slides, all data-driven, no manual maintenance)

1. **Cover** — "Supply Chain Tech Hub — Monthly Review" + date + presenter
2. **Headline numbers** — Active projects, Actions in flight, Blockers, Pipeline intake (4 huge KPI tiles)
3. **Workstream scorecard** — OX / DW / EX / AU, status pills, top 1 highlight + 1 risk per stream
4. **Wins this period** — 3–5 most recent Completed actions/projects
5. **In flight (focus)** — top 3 strategic projects, status, owner, next milestone
6. **Risks & blockers** — red panel, owner + age, asks for the Head of SCM
7. **Pipeline / what's next** — approved + scheduled intake, expected start
8. **Period Roadmap snapshot** — quarterly bands, current quarter highlighted
9. **Tech Pulse highlight** — hero story
10. **Asks** — 3 bullet decisions / approvals needed

### Interactions

- **Keyboard nav** — ← → arrows, `P` to enter, `Esc` to exit, `F` fullscreen
- **Slide rail** — bottom thumbnail strip, hide-on-idle
- **Presenter notes** — toggle `N`, shows context + suggested talking points per slide
- **Live data** — slides read from the same store; if Admin edits something mid-meeting it reflects immediately
- **Filters preserved** — entering Briefing from Dashboard carries the active workstream filter through (e.g. brief only on OX)
- **Print/Export** — `Cmd+P` → 16:9 PDF handout (one slide per page)

### Technical approach

- New route `src/routes/briefing.tsx` with internal `<Slide>` components
- Fixed 1920×1080 canvas scaled to viewport (`transform: scale`)
- Semantic typography: `.slide-title` 88px, `.slide-body` 32px, `.slide-kicker` 22px — large enough for a projector
- Uses existing data: `projects`, `pipelineItems`, `updates` from store; no new data model
- `?slide=N` URL param for deep links and refresh-safe nav

---

## Order of work

1. Global typography + `SurfaceCard` + `StatusPill` primitives (foundation)
2. Per-screen passes: Dashboard → Portfolio → Pipeline → Sprint Board → Roadmap → Tech Pulse
3. Briefing Mode route + 10 slides + nav + presenter notes
4. "Present" launcher in `AppShell` top bar (visible always; pre-fills filters from current screen)

---

## Questions before I build

1. **Briefing length** — 10 slides as above, or shorter (6) / longer (15)?
2. **Branding** — apply Gulf Cryo colors/logo to Briefing Mode now, or keep the current Indigo theme and brand later?
3. **Scope of UI pass** — do all 6 screens, or start with Dashboard + Briefing only and iterate?

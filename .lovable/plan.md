# Where the checklist stands

Completed in earlier phases:
- Phase 1 — Rebrand to "Supply Chain Tech Hub" + expanded project/task data model with Task ID, Tech/Business Owners, "Currently With", Sprint flag, Enhancement Log, latest timestamped update; Portfolio page with Projects↔Tasks scope toggle, List/Grid views, search and workstream/status/sprint filters.
- Phase 2 — Newsletter route (`/newsletter`) with KPI bento, featured updates, workstream digests, chronological feed; dashboard "Latest from SCM Tech Pulse" strip.
- Phase 3 — Admin route (`/admin`) with tabs for Projects, Tasks, Enhancement Log, Newsletter (inline edit, add/remove, append log, compose update) wired with sonner toasts.

Not yet done — what the 4 attached design files target:

| File | Screen | Current route | Gap vs mock |
|---|---|---|---|
| Design1 | Sprint Board (Kanban) | `/sprint-board` | Mock has 7 columns (Backlog, Prioritized, In Current Sprint, In Progress, Blocked, UAT, Done), board toolbar with sprint title + sprint switcher + filters, blocked column styled critical, card chips for workstream + tech stack + priority + due. Current build has 5 columns and lighter toolbar. |
| Design2 | Executive Dashboard | `/` | Mock has 6-KPI surgical grid (142 / 84 / 32 / 7 critical / 12 high / 14d avg), workstream filter bar with portfolio distribution, asymmetric project grid (OX/DW/AU large cards + EX portfolio-wide card + Blockers side card), FAB. Current dashboard is simpler. |
| Design3 | Data Import Wizard | `/import` | Mock has 3-step stepper, 2-col layout: upload dropzone + selected file mockup + data mapping rows + preview/validate table on the left; instructions card + summary card on the right; toast overlay. Current page is a thinner stepper-only version. |
| Design4 | Newsletter — Strategic Impact Report | `/newsletter` | Mock has hero, 4-card Impact Stats bento, four workstream enhancement sections (OX/EX/AU/DW) in bento grid, Visual Velocity Impact custom chart block, footer. Current newsletter has a feed/digest layout, not the bento/per-workstream report layout. |

# Phase 4 plan — bring the 4 screens up to the mocks

Scope: visual + structural realignment to match the attached HTML. Reuse existing data in `src/data/projects.ts` and `src/data/newsletter.ts`; no schema changes, no backend. Keep "Supply Chain Tech Hub" branding (replace "PMO Command Center" copy from the mocks).

1. `src/routes/sprint-board.tsx`
   - Expand to 7 columns matching mock order; "Blocked" header in `text-status-critical`.
   - Add board toolbar: sprint title, sprint switcher select, workstream filter chips, search.
   - Task card: workstream tag, priority pill, tech stack icon row, due date, assignee avatar, blocked reason on Blocked cards.

2. `src/routes/index.tsx` (Executive Dashboard)
   - Replace top section with the 6-KPI surgical grid (Total / Active / Sprint / Critical-red / High-orange / Avg cycle).
   - Add Workstream Filter / Portfolio Distribution bar.
   - Asymmetric project grid: 3 large workstream cards (OX, DW, AU) + wide EX portfolio-impact card + side "Roadblocker / Quick Actions" card.
   - Keep the "Latest from SCM Tech Pulse" preview strip below.
   - Add floating action button.

3. `src/routes/import.tsx`
   - 2-column layout: left = upload dropzone with selected-file mock + Data Mapping rows (source → target select) + Preview & Validate table with row-status pills.
   - Right = Instructions card + Summary card.
   - Keep 3-step stepper at top; add sonner toast for "Mapping saved".

4. `src/routes/newsletter.tsx`
   - Rebuild as Strategic Impact Report: hero, 4-card Impact Stats bento, 2x2 workstream bento (OX/EX/AU/DW) with enhancement bullet lists from `newsletter.ts`, Visual Velocity Impact chart (CSS bars, no new lib), footer.

## Technical notes

- Pure presentational refactor of 4 route files; no new packages, no data-model changes.
- Use existing tokens in `src/styles.css` (workstream-ox/ex/au/dw, status-critical/high/medium/low). Add a few utility classes if needed (bento spans, kanban column min-width already present).
- Material Symbols font already loaded in `__root.tsx`.
- Verify `bun run build:dev` after each route edit.

Out of scope for this phase: persistence/Supabase, real file upload, real charts library, Admin page changes (already shipped).

## Goal
Refresh every page with a cohesive modern card system, add a working light/dark theme toggle, make the Sprint Board fully drag-and-drop, and reduce friction for editing tasks.

## 1. Theme system (Light + Dark)
- Add semantic tokens in `src/styles.css`: `--background`, `--surface`, `--surface-2`, `--border-subtle`, `--text-primary`, `--text-muted`, `--accent`, `--success`, `--warning`, `--danger`. Define both `:root` (light) and `.dark` (dark) values in OKLCH.
- Map them via `@theme inline` so utilities like `bg-surface`, `text-muted`, `border-subtle` work.
- Create `src/lib/theme.tsx` — `ThemeProvider` + `useTheme()` hook, persisting choice to `localStorage`, defaulting to system preference, toggling the `.dark` class on `<html>`.
- Add a sun/moon toggle in `AppShell` top bar next to the user badge.
- Sweep components: replace hardcoded `bg-white`, `bg-slate-*`, `text-gray-*` with semantic tokens so every page themes cleanly.

## 2. Modern card system
A small shared primitive set in `src/components/ui/surface.tsx`:
- `<Card>` — `bg-surface border border-subtle rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]`, hover lift `hover:shadow-md transition`.
- `<CardHeader>`, `<CardTitle>` (small caps, tracking-wide, muted), `<CardBody>`, `<CardFooter>`.
- `<StatTile>` for KPIs: label, mono numeric, delta chip, optional sparkline.
- `<Pill>` with `tone="info|success|warn|danger|neutral"` mapped to token tints (`/10` bg, `/20` border, solid text).
- Refactor Dashboard, Portfolio, Pipeline, Period Roadmap, Tech Pulse, and Admin to use these primitives so spacing, radius, typography stay consistent.
- Typography: keep Inter for body, Space Grotesk for display headings, JetBrains Mono for IDs/numbers. Trim font sizes to a tight scale (11/12/13/14/16/20/24).

## 3. Drag-and-drop Sprint Board
- Install `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- Rebuild `src/routes/sprint-board.tsx`:
  - `DndContext` wraps the board; each column is a `useDroppable` zone, each card a `useSortable` item.
  - `onDragEnd` updates `store.moveTaskToColumn(taskId, newStatus)` (already exists) and reorders within the column.
  - Visual affordances: grab cursor, drop-zone highlight, dragging card uses `DragOverlay` for smooth ghost.
  - Keep the context-menu fallback for keyboard/no-pointer users.
- Cards get the new `<Card>` styling and a left accent stripe colored by workstream.

## 4. Easier task updates
- Replace heavy modal with a **side-panel sheet** (`src/components/admin-edit/TaskQuickEdit.tsx`) using shadcn `Sheet`:
  - Opens on card click (no admin toggle needed for view; edits gated by `useIsAdmin`).
  - Inline-editable title and description (click to edit, blur to save).
  - One-click pills for status, priority (P1/P2/P3), effort (Low/Med/High), workstream, owner.
  - Auto-save on every change with a tiny "Saved ✓" toast — no Save button required.
  - Keyboard: `E` to focus title, `Esc` to close, `⌘/Ctrl+Enter` to confirm.
- Add the same quick-edit panel to Portfolio drill-down and Dashboard "Matching Actions" rows so tasks are editable everywhere.
- Inline "+ Add task" row at the bottom of each Sprint Board column when admin mode is on — type title, hit Enter, task is created in that column.

## 5. Page-by-page polish
- **Dashboard**: tighten KPI strip to the new `StatTile`; convert workstream chips and category filters into the new `Pill` primitive; table rows use surface tokens.
- **Portfolio**: project rows become `<Card>`s; drill-down task list uses `<Pill>` for status/priority; quick-edit opens the new sheet.
- **Pipeline**: kanban columns share the same drop styling as Sprint Board (read-only DnD between intake stages, gated by admin).
- **Period Roadmap**: cards in the three columns adopt new surface and accent stripe.
- **Tech Pulse**: feed tiles become modern cards with subtle dividers.
- **Admin**: forms wrapped in `<Card>`, consistent spacing.

## 6. Verification
- Playwright screenshot pass on Dashboard, Sprint Board, Portfolio, Pipeline, Roadmap, Tech Pulse in both light and dark.
- Manual DnD smoke test in Sprint Board: drag card between two columns, confirm `store` updates and the card stays in the new column after reload (already persists via store).

## Out of scope
- New data fields or backend changes.
- Briefing/Present mode (kept as-is; will inherit new tokens automatically).
- Branding swap (Gulf Cryo styling) — separate pass.

## Technical notes
- DnD libs: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (small, accessible, works well with React 19).
- Theme persists in `localStorage` under `scm.theme`; hydrate before paint via a tiny inline script in `__root.tsx` head to avoid FOUC.
- All color usage moves to semantic tokens — no `bg-white` / `bg-slate-900` literals in components after the sweep.

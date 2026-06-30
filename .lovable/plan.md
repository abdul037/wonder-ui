## Goal
Slim the Admin workspace down to **Newsletter** and **Import Data** only. Move all project/task/pipeline editing onto the pages where that data already lives (Portfolio, Pipeline, Sprint Board, Period Roadmap), gated by an `isAdmin` flag so non-admins keep the read-only view.

## 1. Admin role context
- Add a tiny `src/context/AdminContext.tsx` exposing `{ isAdmin, toggleAdmin }`, persisted to `localStorage` (no auth backend yet — this is a UI gate we can wire to Supabase roles later).
- Mount the provider in `src/routes/__root.tsx`.
- Add an **"Admin mode"** toggle (switch + shield icon) in the topbar inside `src/components/AppShell.tsx` so the user can flip in/out of edit mode from any page.

## 2. Admin page cleanup (`src/routes/admin.tsx`)
- Remove the **Projects**, **Tasks**, and **Pipeline** tabs and their forms/handlers.
- Keep only two tabs: **Newsletter** and **Import Data** (already a sub-component).
- Update the page header copy to "Content & Data Admin" and drop the now-unused imports / mock mutation helpers.
- Leave the underlying `src/data/*` mutation helpers in place (they'll be reused by the inline editors).

## 3. Inline editing on the dashboards
Pattern for each page: when `isAdmin` is true, show edit affordances; otherwise render exactly as today.

- **Portfolio (`src/routes/portfolio.tsx`)**
  - Each project card/row gets a pencil button → opens a shared `ProjectEditDialog` (name, workstream, status, priority, owners, latest update).
  - "New Project" button in the page header.
  - Same dialog reused from the Tasks view for task edit/create with task-specific fields (status, effort, priority, release mode, currently with).

- **Pipeline (`src/routes/pipeline.tsx`)**
  - Each intake card gets edit + "Promote to Active" buttons (promote logic already exists in admin — move it into a shared util `src/data/pipeline.ts`).
  - "New Intake" button in header opens `PipelineEditDialog`.

- **Sprint Board (`src/routes/sprint-board.tsx`)**
  - Card edit button opens the task dialog above.
  - Column header "+" button to add a task into that status.
  - (Drag-and-drop stays out of scope for this pass.)

- **Period Roadmap (`src/routes/unified-roadmap.tsx`)**
  - Inline edit pencil on Active / Pipeline / BAU rows opens the relevant dialog (project or intake).
  - "Add" buttons at the top of each of the three columns.

## 4. Shared edit components
Create under `src/components/admin-edit/`:
- `ProjectEditDialog.tsx`
- `TaskEditDialog.tsx`
- `PipelineEditDialog.tsx`
- `AdminOnly.tsx` — small wrapper that renders children only when `isAdmin`.

These wrap existing shadcn `Dialog` + `Form` patterns and call the existing in-memory mutation helpers, with `sonner` toasts on save/delete.

## 5. Navigation & misc
- No sidebar nav changes (Admin link stays, just slimmer).
- Remove dead imports/types created by the deleted admin tabs.
- Type-check after the refactor.

## Out of scope
- Real auth / Supabase role wiring (the toggle is a placeholder we can swap for `has_role(auth.uid(),'admin')` later).
- Drag-and-drop on Sprint Board / Roadmap.
- Bulk edit.

Confirm and I'll implement.

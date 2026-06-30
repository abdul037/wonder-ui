
## Goals

1. **Sprint Board**: in Admin mode, edit, move, add and delete tasks inline — no navigating away.
2. **Portfolio · Tasks**: tasks are currently read-only. Add full inline editing.
3. **Portfolio default view**: lead with **Projects**, and let each project row "drill down" to its tasks inline, instead of a separate top-level Tasks tab being the primary scope.

---

## 1. Sprint Board — drive from real data + inline edit

Today the board is a hardcoded `columns` array in `src/routes/sprint-board.tsx`, completely disconnected from `projects[].tasks[]` in the shared store. Editing here would not persist anywhere. Fix the foundation first, then add edit affordances.

**Data swap**
- Remove the local `columns` constant and the local `Task` type.
- Derive the 7 columns (Backlog, Prioritized, In Current Sprint, In Progress, Blocked, UAT, Done) from `projects[].tasks[]` using a single rule per column based on `task.status` + `task.inSprint`. Columns become: Backlog (`!inSprint && status === "On Track"`), Prioritized (`!inSprint && priority HIGH/CRITICAL`), In Current Sprint (`inSprint && status === "On Track"`), In Progress, Blocked, UAT (status `In Progress` flagged `uat`), Done (`Completed`). Extend `Task` in `src/data/projects.ts` with an optional `boardColumn?: "backlog" | "prio" | "sprint" | "progress" | "blocked" | "uat" | "done"` to make the column explicit and let drag-and-drop change it.
- Subscribe via `useDataVersion()` so edits propagate live to Dashboard / Portfolio / Sprint Board.

**Admin inline editing**
- Each `TaskCard` shows a pencil in Admin mode → opens a new `TaskEditDialog` (mirrors `ProjectEditDialog`). Fields: title, status, board column, sprint toggle + sprint name, currently with, tech owner, business owner, priority, latest update.
- Each card also gets a small "move to column" chevron menu (Admin only) so users can reassign without a full edit.
- Each card gets a delete button (Admin only) with confirm toast.
- The existing "Add Task" placeholder button becomes functional in Admin: opens the dialog with a project picker (since a task must belong to a project) and creates via `createTask(projectId, draft)`.
- Non-admins see the board exactly as today (read-only, no pencils, no delete, no add).

**Store additions in `src/lib/store.ts`**
- Extend `TaskDraft` with `priority` and `boardColumn`.
- Add `moveTaskColumn(projectId, taskId, column)` for the chevron quick-move.
- `applyTaskDraft` keeps the existing signature, just writes the two new fields.

**Banner**: replace the current "edit from Portfolio" banner with "Admin mode is ON — click any card to edit, drag the chevron to move columns".

---

## 2. Portfolio — projects-first with task drilldown + editable tasks

**Drilldown UX (replaces the Projects/Tasks top-level toggle as the primary navigation)**
- Keep the `scope` toggle but rename it: **Projects (default)** and **All Tasks** (flat view, unchanged behavior for power users).
- In Projects · List view, each row gets a chevron on the left. Clicking expands an inline panel directly under the row showing that project's tasks in a compact table (Task, ID, Sprint, Status, Currently With, Latest Update, + edit pencil). Multi-row expansion allowed.
- In Projects · Grid view, each card grows an "X tasks" footer link that toggles a tasks list inside the card.
- "Open project" (full project detail page) remains available via the project name link.

**Editable tasks (everywhere tasks appear)**
- New `src/components/admin-edit/TaskEditDialog.tsx` — same pattern as `ProjectEditDialog`, backed by `applyTaskDraft` / `createTask` / `deleteTask`.
- In Admin mode: every task row (drilldown, All Tasks table, All Tasks grid) shows a pencil; every project row/card with a tasks panel shows "+ Add task".
- Non-admins see the drilldown but no edit controls.

---

## 3. Files touched

```text
src/data/projects.ts                          add Task.boardColumn?, derive default
src/lib/store.ts                              extend TaskDraft (priority, boardColumn)
                                              add moveTaskColumn()
src/components/admin-edit/TaskEditDialog.tsx  NEW — create/edit/delete task
src/routes/sprint-board.tsx                   derive columns from store; pencil + quick-move + delete + add; admin banner update
src/routes/portfolio.tsx                      drilldown rows/cards; pencil on task rows; "+ Add task" per project in Admin
```

No backend, no schema. All edits flow through the existing in-memory store + `useDataVersion()` so changes propagate live across Dashboard, Portfolio, Sprint Board, Roadmap and Tech Pulse.

---

## Open question

For the Sprint Board's "move task between columns" interaction in Admin mode, which do you prefer?

- **A. Chevron menu only** (click → pick column from dropdown). Simpler, ships fast, works on touch.
- **B. Real drag-and-drop** between columns (using a small library like `@dnd-kit/core`). Nicer UX, adds a dependency and ~1 extra step.

I'll default to **A** unless you say otherwise.

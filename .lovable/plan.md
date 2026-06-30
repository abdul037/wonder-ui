# Portfolio Audit & Enhancement Plan

## What's broken / missing today

### 1. Updates & Logs (biggest gap)
- **Project detail (`/portfolio/$projectId`)**: Status, Target Date, Latest Update and Hours fields are local `useState` — **Save Changes does nothing**. No autosave, no toast, no persistence.
- **No update history**: `Task.latestUpdate` and `Project.latestUpdate` only hold the *last* line. Earlier updates are lost the moment you type a new one.
- **Enhancement Log is unreachable inline**: list view shows a count chip but you must navigate to the project page to read entries; the detail page doesn't even render `enhancementLog`.
- **No "quick update" affordance** anywhere — to log a new note you must (a) navigate to the project, (b) overwrite the Executive Update textarea, (c) press a Save button that doesn't save.
- **Blockers "+ Add Blocker"** button is a placeholder — no handler.
- **Timeline is read-only** — no way to add a milestone from the UI.

### 2. Drill-down (project row → tasks)
- Task rows are 1-line, dense, no priority/workstream/sprint context.
- Latest update is a single truncated grey line; no timestamp visible.
- No way to *add an update* without opening the full Task editor.
- No grouping (by status/column), no sort, no inline filter.

### 3. Project detail page UI
- Missing the three new SCM fields: **Tech Owner**, **Business Owner**, **Currently With** (they exist on the model, not rendered).
- Missing the **Enhancement Log** section entirely.
- Missing the **Tasks list** for the project on its own detail page.
- Hard-coded button row ("Cancel / Save / Escalate") looks transactional but is non-functional.
- Cramped at `max-w-5xl`, no sticky header, no breadcrumb back-state.

### 4. Portfolio list/grid UX
- No sort on table columns, no column-density toggle, no sticky header row.
- "Log" column shows a count but is not a popover — you can't peek.
- No empty-state when filters return zero rows.
- "All Tasks" scope has no priority/workstream chip rendered on each row.

---

## Proposed changes

### A. New `UpdateLog` model (data layer)
Extend `Task` and `Project` with `updates: UpdateEntry[]` (append-only).  
`latestUpdate` becomes a derived getter (`updates[0]`). Store helpers:

- `appendProjectUpdate(projectId, text)` → unshifts entry, bumps timestamp.
- `appendTaskUpdate(projectId, taskId, text)` → same for tasks.
- `addBlocker(projectId, { title, detail })` / `removeBlocker(...)`.
- `addTimelineEvent(projectId, { date, title, detail })`.

(Enhancement Log on projects already exists; we'll merge it into the same timeline view.)

### B. New `<QuickUpdate>` component (used everywhere)
Single-line composer: textarea + "Post update" button.  
Optional toggle: *Also flag as blocker*. Shown in:

- Project row drill-down header.
- Task drill-down rows (expand-to-update).
- Project detail page (replaces the broken Save form).
- TaskQuickEdit side sheet (above the existing fields).

Admins post freely; non-admins see the log read-only.

### C. Project drill-down (row expansion) redesign
- Header strip: project name, workstream chip, status pill, **"+ Post update"** button, **"+ Add task"** button.
- Three small tabs: **Tasks** · **Updates** · **Blockers**.
- Tasks tab: grouped by board column (Backlog / In Sprint / In Progress / Blocked / UAT / Done), each row shows priority dot, owner avatar, age. Click row → side sheet (existing TaskQuickEdit).
- Updates tab: timeline list of `updates[]` with relative time + author chip, composer at top.
- Blockers tab: card per blocker with resolve action; "Add blocker" inline.

### D. `/portfolio/$projectId` rebuild
- Two-column layout (left: meta + progress dial, right: stakeholders + owners).
- Sections, in order:
  1. **Snapshot**: progress, status pill, target date, est. hours — all inline-editable for admins (autosave via store).
  2. **Stakeholders**: Primary Stakeholder, Owner, Tech Owner, Business Owner, Currently With (the missing three).
  3. **Tasks**: same drill-down component as the list.
  4. **Update Log** (new): composer + reverse-chronological list, merges `updates` + `enhancementLog`.
  5. **Blockers**: existing + add/resolve actions wired.
  6. **Timeline**: existing + add-event row.
  7. **Stack Inventory**: unchanged.
- Remove the dead Cancel / Save / Escalate footer; replace with a single "View on Sprint Board" link + admin "Delete project" affordance.

### E. List / Grid polish
- Sticky table header.
- Click "Log" count → popover showing last 3 updates + "View all".
- Sort by clicking column headers (Status, Latest Update, Workstream).
- Empty-state illustration when filters yield no rows.
- Grid card: add small "Post update" pill in the footer.

### F. TaskQuickEdit side sheet
- Add an **Updates** section above "Latest update": list of `task.updates[]` with timestamps + composer that appends instead of overwriting.

---

## Files to touch

- `src/data/projects.ts` — add `updates: UpdateEntry[]` to `Task` and `Project`; seed from existing `latestUpdate`.
- `src/lib/store.ts` — `appendProjectUpdate`, `appendTaskUpdate`, `addBlocker`, `resolveBlocker`, `addTimelineEvent`.
- `src/components/portfolio/QuickUpdate.tsx` *(new)* — shared composer.
- `src/components/portfolio/UpdateTimeline.tsx` *(new)* — reverse-chronological list.
- `src/routes/portfolio.tsx` — drill-down tabs + sortable headers + Log popover.
- `src/routes/portfolio.$projectId.tsx` — full rebuild per section D.
- `src/components/admin-edit/TaskQuickEdit.tsx` — append-update flow.

## Out of scope (call out if you want them in)
- Real auth-backed authorship on update entries (currently we'd attribute to "Abdul Muwahib").
- Server persistence (changes live in client store until you wire Supabase).
- Bulk-edit / multi-select on the list.

Approve and I'll implement A → F in that order, smallest commits first so the UI stays usable throughout.
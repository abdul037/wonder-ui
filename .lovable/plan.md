
## Phase 1 — Rebrand + expanded Projects & Tasks

Scope is intentionally limited. Newsletter page, Admin page, and persistence come in later phases.

## 1. Rebrand: "PMO Command Center" → **Supply Chain Tech Hub**

- Sidebar header (`AppShell.tsx`): logo block reads `Supply Chain Tech Hub` with tagline *Projects · Tasks · Enhancements*.
- Top bar wordmark + browser titles.
- Per-route `head()` metas in `__root.tsx`, `index.tsx`, `portfolio.tsx`, `portfolio.$projectId.tsx`, `sprint-board.tsx`, `roadmap.tsx`, `import.tsx`, `settings.tsx`, `support.tsx` — title pattern `<Page> | Supply Chain Tech Hub`, matching `og:title` / `og:description`.
- Dashboard hero copy + greeting line updated to SCM framing.

No URL/route changes.

## 2. Expanded Projects + Tasks data model

Edit `src/data/projects.ts`:

```ts
type Task = {
  id: string;          // T-1042
  name: string;
  type: "Enhancement" | "Bug" | "Discovery" | "Integration" | "Strategic";
  inSprint: boolean;
  sprint?: string;     // "Sprint 24"
  status: Status;
  currentlyWith: { name: string; initials: string };
  techOwner:    { name: string; initials: string };
  businessOwner:{ name: string; initials: string };
  latestUpdate: { text: string; at: string }; // ISO timestamp
};

type Project = {
  ...existing,
  techOwner: { name: string; initials: string };
  businessOwner: { name: string; initials: string };
  currentlyWith: { name: string; initials: string };
  enhancementLog: { date: string; entry: string }[];
  latestUpdate: { text: string; at: string };
  tasks: Task[];
};
```

Re-seed the 6 existing projects with realistic SCM tasks (e.g. for Fero Auto-Plan: "API Integration Layer", "Telemetry Schema v2", "OAuth Handshake"). Keep existing IDs so detail route still resolves.

## 3. Projects page (`/portfolio`) overhaul

Rename page header to **Projects & Tasks**. Add:

- **View toggle** top-right: `view_list` ↔ `grid_view` (local `useState`, default `list`).
- **Filter bar**: workstream multi-select chips, status dropdown, sprint dropdown, free-text search across project/task name + owner.
- **Scope toggle**: `Projects` ↔ `Tasks` — switches between project-level rows and task-level rows (tasks flattened with their parent project name).

### List view columns (table)
Project · Task · Task ID · Type · In Sprint · Status · Currently With · Tech Owner · Business Owner · Enhancement Log (icon → opens project detail's log section) · Latest Update *(text + relative timestamp)* · Workstream chip.

Sticky header, hover row, click row → `/portfolio/$projectId`.

### Grid view (cards)
Card per project (or per task in Tasks scope) showing:
- Workstream color rail (left border, matching Design1 sprint cards).
- Project / task name + Task ID chip.
- Status pill + In-Sprint pill.
- Three avatar rows: Currently With · Tech · Business.
- Latest update preview line with `schedule` icon + relative time.
- Footer: enhancement count + "View details →".

Responsive: 1 / 2 / 3 columns at sm / md / xl.

## 4. Small UI polish (carried from attached designs, no scope creep)

- Use `card-hover-effect` (subtle shadow + 1px translate) from Design1 on project cards and table rows.
- Workstream rail color uses the existing `workstream-*` tokens.

## Files

- **Edit**: `src/data/projects.ts`, `src/components/AppShell.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/portfolio.tsx`, `src/routes/portfolio.$projectId.tsx`, `src/routes/sprint-board.tsx`, `src/routes/roadmap.tsx`, `src/routes/import.tsx`, `src/routes/settings.tsx`, `src/routes/support.tsx`, `src/styles.css` (add `card-hover-effect` utility + safelist any new dynamic classes).
- **Add**: `src/components/projects/ProjectsTable.tsx`, `src/components/projects/ProjectsGrid.tsx`, `src/components/projects/ProjectsFilters.tsx`, helper `src/lib/time.ts` for relative timestamps.

## Out of scope (future phases)

- Phase 2: `/newsletter` page from Design4 (workstream impact cards, KPI bento, live updates feed).
- Phase 3: `/admin` page (CRUD over projects, tasks, newsletter posts, product updates).
- Phase 4: Lovable Cloud persistence to replace in-memory data.

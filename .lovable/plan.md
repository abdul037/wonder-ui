
## What I'll build

A "PMO Command Center" strategic project management dashboard, translating the 7 HTML mocks into a TanStack Start app with shared layout and per-screen routes.

## Routes

All routes share a persistent sidebar (Dashboard, Portfolio, Sprint Board, Roadmap, Settings, Support) and topbar (search, Add New Item, theme toggle, notifications, user profile) extracted from the mocks.

| Route | Screen | Source |
|---|---|---|
| `/` | Executive Dashboard — KPI cards, portfolio distribution chips, project cards, key milestones, critical blockers | screen 3 |
| `/portfolio` | Project Log — filterable/sortable table of all projects | screen 4 |
| `/portfolio/$projectId` | Project Detail & Edit — full project view with editable fields | screen 5 |
| `/sprint-board` | Sprint Board — kanban columns | screen 1 (2 is a duplicate, skipped) |
| `/roadmap` | Roadmap / Executive Oversight overview | screen 0 |
| `/import` | Import Data — CSV/file upload wizard | screen 6 |

`/settings` and `/support` will be placeholder pages with the shared shell.

## Design system

Theme uses the Executive Command palette from the mocks: indigo primary `#4744e5`, neutral surfaces, Inter + JetBrains Mono + Material Symbols Outlined fonts. Tokens go in `src/styles.css` as oklch variables; fonts loaded via `<link>` in `__root.tsx` head. Light + dark variants wired to the topbar toggle.

## Implementation notes (technical)

- Fully static/presentational — no backend, no auth. State is local component state where the mocks imply interaction (tab toggles, filter chips, sprint board column data).
- Mock data lives in `src/data/*.ts` (projects, sprints, milestones, blockers, KPIs) so cards, table, and detail page share one source.
- Project detail uses `createFileRoute("/portfolio/$projectId")` with a loader reading from mock data; "Edit" toggles inline editable fields (controlled inputs, no persistence).
- Material Symbols icons used as in mocks (already on Google Fonts).
- Images: the mocks reference avatar/photo URLs — hotlinked directly as instructed.
- No Lovable Cloud (no persistence requested).

## Out of scope

- Real data persistence, auth, file processing on the Import page (UI only, shows a fake success state).
- The duplicate Sprint Board screen (mock 2).

Ready to build on approval.

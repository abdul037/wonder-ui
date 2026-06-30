# Complete Supply Chain Tech Hub — Phase 2 & 3

Phase 1 (rebrand + expanded Portfolio with List/Grid + Task IDs/Owners) is already shipped. This plan finishes the remaining two phases requested earlier: **Newsletter** and **Admin**, plus light polish to wire them into the shell.

---

## Phase 2 — Newsletter (`/newsletter`)

A live "SCM Tech Pulse" page where enhancements, releases, and product updates are broadcast.

**Layout (single column, magazine-style):**
- Hero band: issue number, publish date, "Subscribe" CTA (visual only).
- KPI bento (4 cards): Live Enhancements, Shipped This Week, Active Sprints, Roadblockers Cleared — sourced from existing `projects.ts`.
- Featured Update: large card with hero gradient, workstream tag, summary, "Read more".
- Updates Feed: vertical timeline grouped by date, each entry shows workstream rail, title, body, linked project/task chips, author + timestamp.
- Workstream Digest: 4-column grid (OX / EX / AU / DW) with bullet highlights per stream.
- Footer CTA: "Submit an update" → links to `/admin`.

**Data:** new `src/data/newsletter.ts` with `NewsletterIssue` and `UpdateEntry` types, seeded from existing project `latestUpdate` + `enhancementLog` so content stays consistent.

---

## Phase 3 — Admin (`/admin`)

Single internal workspace to manage all content surfaces. Presentational only (local state via `useState`, no backend) so it's a faithful UI prototype matching the rest of the app.

**Structure:** left sub-nav inside the page with 4 tabs:

1. **Projects** — table of all projects with inline-editable status / priority / owners, "New Project" dialog, delete confirm.
2. **Tasks** — task table filtered by project, edit Task ID, type, sprint, currentlyWith, status; add/remove tasks.
3. **Enhancement Log** — chronological list of log entries per project with an "Add Log Entry" form (workstream, title, body, author).
4. **Newsletter / Product Updates** — composer (title, summary, body textarea, workstream multi-select, feature toggle, publish date) + list of existing entries with edit/delete.

Each tab uses shadcn `Tabs`, `Table`, `Dialog`, `Input`, `Textarea`, `Select`, `Switch`, `Badge`. Toasts via `sonner` for save/delete feedback.

**Auth note:** No real auth in this phase — page is reachable directly. We'll mark it "Internal" in the header. Real auth + persistence can come in a later phase if requested.

---

## Shell + Polish

- `AppShell.tsx`: add **Newsletter** (icon `campaign`) and **Admin** (icon `admin_panel_settings`) to sidebar; group "Workspace" vs "Manage".
- `__root.tsx` / new route `head()`s: per-page titles + OG description.
- Dashboard (`/`): add a compact "Latest from the Newsletter" strip linking to `/newsletter`.
- Styles: reuse existing tokens — no new colors. Add `.timeline-rail` + `.kpi-bento` utilities to `src/styles.css`.

---

## Files

**New**
- `src/routes/newsletter.tsx`
- `src/routes/admin.tsx`
- `src/data/newsletter.ts`
- `src/components/newsletter/UpdateCard.tsx`
- `src/components/newsletter/WorkstreamDigest.tsx`
- `src/components/admin/ProjectsAdmin.tsx`
- `src/components/admin/TasksAdmin.tsx`
- `src/components/admin/LogsAdmin.tsx`
- `src/components/admin/NewsletterAdmin.tsx`

**Edited**
- `src/components/AppShell.tsx` — sidebar entries + grouping
- `src/routes/index.tsx` — newsletter strip
- `src/styles.css` — small utility additions

---

## Out of scope (call out for later phases)

- Real persistence (Supabase tables for projects/tasks/logs/newsletter).
- Auth + role-gating for `/admin`.
- Email delivery of the newsletter.
- File uploads / rich-text editor.

Confirm and I'll build it.

## Pipeline / Intake — new top-level entity

Today the dashboard has no concept of "expected" projects — every record is already active. This adds a separate **Pipeline** entity for ideas/requests not yet promoted to active projects.

### 1. Data model (`src/data/pipeline.ts`)

New `PipelineItem` type with the full field set you picked:

```text
id              string
name            string
workstream      OX | EX | AU | DW
expectedStart   ISO date string
businessOwner   { name, initials }
techOwner       { name, initials }
priority        Critical | High | Medium | Low
effort          Low | Medium | High
description     string
source          Business Request | Internal Idea | Mandate
stage           Idea | Under Review | Approved | Scheduled
createdAt       ISO date string
```

Seed with 6–8 realistic mock items across the four workstreams and stages, so the dashboard panel and `/pipeline` page have content immediately.

### 2. Executive Overview (`src/routes/index.tsx`)

- **New KPI card** "Pipeline Intake" (count of pipeline items) added to the existing 6-card strip, replacing "Avg. Delivery" which is decorative.
- **New panel** "Expected Pipeline" placed in the bottom row next to Key Milestones / Critical Blockers (3-column grid on lg, stacks on mobile). Shows top 5 upcoming items sorted by `expectedStart`, each row: workstream chip, name, business owner avatar, expected start date, stage pill. Header has "View pipeline →" link to `/pipeline`.
- Workstream filter chips in Portfolio Distribution also scope the pipeline panel (consistent with existing scoping behavior).

### 3. New route `/pipeline` (`src/routes/pipeline.tsx`)

Full-page intake board with:
- Header + "New intake" CTA (links to Admin).
- Filter row: workstream, stage, priority, source.
- Grouped view by stage (Idea → Under Review → Approved → Scheduled) as 4 columns of cards, or a list view toggle.
- Each card shows: name, workstream chip, priority/effort badges, both owners, expected start, source tag, 2-line description, and a "Promote to Active" action (UI only — wires to admin in step 4).
- Added to `AppShell` nav between "Portfolio" and "Sprint Board" with a `pending_actions` icon.

### 4. Admin page (`src/routes/admin.tsx`)

Add a new "Pipeline" tab next to Projects / Tasks / Newsletter:
- Table of all pipeline items with inline edit (stage, priority, owners, expected start).
- "Add intake" form with all 10 fields.
- "Promote to project" action that converts a pipeline item into a `Project` entry (mock — pushes onto the in-memory project list, shows a sonner toast).
- "Delete intake" with confirm.

### 5. Storage

Mock data only — same pattern as `projects.ts` and `newsletter.ts`. No Supabase migration in this phase; we can wire it to a `pipeline_items` table later when you're ready to persist.

### Out of scope (call out if you want them in)

- Persisting pipeline items to Supabase.
- Capacity/effort roll-ups on the dashboard ("expected effort by quarter").
- Email/Slack notifications when items are promoted.

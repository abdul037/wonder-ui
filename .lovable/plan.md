## Remove all progress percentages from the dashboard

### Goal
Strip every progress percentage indicator from the dashboard so the page feels cleaner and avoids the confusion the user flagged around "Avg Project Completion".

### Scope
- Remove the top-level **"Avg Project Completion"** KPI tile and its Simple/Weighted toggle from the KPI grid.
- Remove the circular/arc progress dials and percentage labels next to each workstream in the **By Workstream** row.
- Keep the workstream names (Operation Excellence, Employee Experience, Asset Utilization, Data Warehouse / PowerBI) and their project/action counts visible.
- Leave all other dashboard panels untouched (KPI tiles, Portfolio Health, Priority Mix, Live Actions, Owner Workload, Critical Blockers, Milestones, SCM Pulse).

### Files to edit
- `src/routes/index.tsx` — the main dashboard component. Identify the "Avg Project Completion" KPI card and the By-Workstream progress dials, then remove/rework those JSX blocks.
- `src/styles.css` — optionally clean up any utility classes that were added only for the progress dials or toggle if they become orphaned.

### How
- In the KPI grid, delete the tile that renders the average completion value and the Simple/Weighted toggle. Re-balance the grid from 6 to 5 tiles if needed, or let the remaining tiles reflow.
- In the By Workstream row, replace the circular dial + percentage with a simpler horizontal card that still shows full workstream name, status, and project/action counts.
- Verify build passes and no unused imports/variables remain after the deletion.

### Out of scope
- No changes to data model or calculations in `src/data/projects.ts`.
- No changes to other routes (portfolio, sprint board, newsletter, admin, etc.).
- No redesign of the Gulf Cryo branding yet (that is a later phase).
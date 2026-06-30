import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { projects, type Workstream, type Priority, type Status } from "@/data/projects";

export const Route = createFileRoute("/unified-roadmap")({
  head: () => ({
    meta: [
      { title: "Unified Roadmap | Supply Chain Tech Hub" },
      { name: "description", content: "Delivery roadmap — Q3 2026 target dates and timelines by workstream." },
      { property: "og:title", content: "Unified Roadmap | Supply Chain Tech Hub" },
      { property: "og:description", content: "Delivery roadmap — target dates and timelines by workstream." },
    ],
  }),
  component: UnifiedRoadmap,
});

const WS_COLOR: Record<Workstream, string> = {
  OX: "#3730a3",
  EX: "#6b21a8",
  AU: "#92400e",
  DW: "#0f766e",
};
const WS_BG: Record<Workstream, string> = {
  OX: "bg-indigo-50 text-indigo-800",
  EX: "bg-purple-50 text-purple-800",
  AU: "bg-amber-50 text-amber-800",
  DW: "bg-teal-50 text-teal-800",
};
const PRIO_BG: Record<Priority, string> = {
  Critical: "bg-rose-50 text-rose-700",
  High: "bg-orange-50 text-orange-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-emerald-50 text-emerald-700",
};
const PRIO_ORD: Record<Priority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const STATUS_BG: Record<Status, string> = {
  "On Track": "bg-emerald-50 text-emerald-700",
  "In Progress": "bg-indigo-50 text-indigo-700",
  Blocked: "bg-rose-50 text-rose-700",
  Delayed: "bg-orange-50 text-orange-700",
  Completed: "bg-slate-100 text-slate-700",
};

const WINDOW_START = new Date("2026-06-01");
const WINDOW_END = new Date("2026-09-30");
const TOTAL = (WINDOW_END.getTime() - WINDOW_START.getTime()) / 86_400_000;

function UnifiedRoadmap() {
  const today = new Date();
  const sorted = [...projects].sort(
    (a, b) => PRIO_ORD[a.priority] - PRIO_ORD[b.priority],
  );

  return (
    <AppShell>
      <div className="px-8 py-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black text-on-surface">Unified Roadmap</h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Delivery roadmap · Q3 2026 · Target dates &amp; timeline by workstream
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
            {(["OX", "EX", "AU", "DW"] as Workstream[]).map((ws) => (
              <span key={ws} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: WS_COLOR[ws] }} />
                {ws}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-border-subtle text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="text-left font-semibold px-4 py-2.5 w-[220px]">Project</th>
                <th className="text-left font-semibold px-4 py-2.5">WS</th>
                <th className="text-left font-semibold px-4 py-2.5">Priority</th>
                <th className="text-left font-semibold px-4 py-2.5">Status</th>
                <th className="text-left font-semibold px-4 py-2.5 w-[100px]">Progress</th>
                <th className="text-left font-semibold px-4 py-2.5">Target</th>
                <th className="text-left font-semibold px-4 py-2.5">Timeline</th>
                <th className="text-left font-semibold px-4 py-2.5">Blocker</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const start = today < WINDOW_START ? WINDOW_START : today;
                const target = new Date(p.targetDate);
                const leftPct = Math.max(
                  0,
                  ((start.getTime() - WINDOW_START.getTime()) / 86_400_000 / TOTAL) * 100,
                );
                const widthPct = Math.max(
                  3,
                  Math.min(
                    100 - leftPct,
                    ((target.getTime() - start.getTime()) / 86_400_000 / TOTAL) * 100,
                  ),
                );
                const color = WS_COLOR[p.workstream];
                return (
                  <tr
                    key={p.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-black/[0.015] cursor-pointer"
                  >
                    <td className="px-4 py-2.5 text-xs">
                      <Link
                        to="/portfolio/$projectId"
                        params={{ projectId: p.id }}
                        className="font-semibold text-on-surface hover:text-primary"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${WS_BG[p.workstream]}`}>
                        {p.workstream}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${PRIO_BG[p.priority]}`}>
                        {p.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_BG[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-[52px] h-[5px] bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${p.progress}%`, background: color }}
                          />
                        </div>
                        <span className="text-[10px] text-on-surface-variant">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] whitespace-nowrap text-on-surface">
                      {p.targetDate}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="relative h-[18px] min-w-[180px] bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="absolute h-full rounded-full flex items-center px-1.5 text-[9px] font-semibold text-white whitespace-nowrap overflow-hidden"
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            background: color,
                            opacity: 0.85,
                          }}
                        >
                          {widthPct > 10 ? p.name.slice(0, 18) : ""}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {p.blocker ? (
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 16, color: "#E11D48" }}
                          title={p.blocker}
                        >
                          warning
                        </span>
                      ) : (
                        <span className="text-[11px] text-on-surface-variant">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
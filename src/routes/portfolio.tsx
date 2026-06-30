import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { projects, statusStyle, priorityStyle, type Workstream } from "@/data/projects";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Project Log | Supply Chain Tech Hub" },
      { name: "description", content: "Cross-functional workstream oversight: status, blockers, stakeholders, and delivery milestones." },
      { property: "og:title", content: "Project Log | Supply Chain Tech Hub" },
      { property: "og:description", content: "Cross-functional workstream oversight with status, blockers and stakeholders." },
    ],
  }),
  component: PortfolioRoute,
});

function PortfolioRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/portfolio") return <Outlet />;
  return <PortfolioIndex />;
}

function PortfolioIndex() {
  const [filter, setFilter] = useState<Workstream | "ALL">("ALL");
  const rows = filter === "ALL" ? projects : projects.filter((p) => p.workstream === filter);
  const blockers = projects.filter((p) => p.blockers.length > 0);

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-4xl font-black text-primary">Project Log</h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Real-time oversight of cross-functional workstreams and delivery milestones.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-card border border-border-subtle rounded-lg text-sm hover:shadow-sm transition-all">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-card border border-border-subtle rounded-lg text-sm hover:shadow-sm transition-all">
                <span className="material-symbols-outlined text-[18px]">file_download</span>
                Export to CSV
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-on-surface-variant mr-2">Workstreams:</span>
            {(["ALL", "OX", "AU", "EX", "DW"] as const).map((w) => {
              const active = filter === w;
              return (
                <button
                  key={w}
                  onClick={() => setFilter(w)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-card border border-border-subtle text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {w === "ALL" ? "All Streams" : w}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm min-w-[1100px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-border-subtle text-on-surface-variant text-xs">
                  {["Project", "Task", "Workstream", "Type", "Priority", "E-ID", "Status", "Stakeholders", "Roadblocker", "Stack", "Updated"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {rows.map((p) => {
                  const ws = p.workstream.toLowerCase();
                  const prio = priorityStyle[p.priority];
                  const st = statusStyle[p.status];
                  return (
                    <tr key={p.id + p.eid} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="px-4 py-4">
                        <Link
                          to="/portfolio/$projectId"
                          params={{ projectId: p.id }}
                          className="font-bold text-on-surface group-hover:text-primary"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4">{p.taskName}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md bg-workstream-${ws}/10 text-workstream-${ws} font-mono text-xs`}>
                          {p.workstream}
                        </span>
                      </td>
                      <td className="px-4 py-4">{p.type}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${prio.bg} ${prio.text}`}>
                          {p.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-on-surface-variant">{p.eid}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex -space-x-2">
                          {p.team.slice(0, 2).map((a, i) => (
                            <img key={i} src={a} alt="" className="w-6 h-6 rounded-full border-2 border-surface-card ring-1 ring-border-subtle" />
                          ))}
                          {p.team.length > 2 && (
                            <div className="w-6 h-6 rounded-full border-2 border-surface-card bg-surface-container-high flex items-center justify-center text-[10px] font-bold">
                              +{p.team.length - 2}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {p.blocker ? (
                          <div className="flex items-center gap-2 text-status-critical">
                            <span className="material-symbols-outlined text-[16px]">warning</span>
                            <span className="whitespace-nowrap">{p.blocker}</span>
                          </div>
                        ) : (
                          <span className="text-on-surface-variant opacity-40 italic">No blockers</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          {p.techStack.map((t) => (
                            <span key={t} className="px-1.5 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] uppercase font-bold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-on-surface-variant whitespace-nowrap">{p.updatedAgo}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-surface-container-low border-t border-border-subtle flex items-center justify-between text-xs text-on-surface-variant">
            <span>Showing {rows.length} of 42 active tasks</span>
            <div className="flex gap-2">
              <button className="p-1 rounded hover:bg-surface-container">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="p-1 rounded hover:bg-surface-container">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-xl border-2 border-status-critical/20 overflow-hidden shadow-md">
          <div className="bg-status-critical/5 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-status-critical/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-status-critical/10 rounded-full flex items-center justify-center text-status-critical">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  emergency_home
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">Roadblocker Command Center</h3>
                <p className="text-sm text-on-surface-variant">
                  {blockers.length} blockers requiring VP-level intervention.
                </p>
              </div>
            </div>
            <button className="bg-status-critical text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">priority_high</span>
              Escalate to PMO Board
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {blockers.map((p) => (
              <Link
                key={p.id}
                to="/portfolio/$projectId"
                params={{ projectId: p.id }}
                className="bg-surface-container-lowest p-4 rounded-lg border border-border-subtle hover:border-status-critical/30 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`font-mono text-xs px-2 py-1 bg-workstream-${p.workstream.toLowerCase()}/10 text-workstream-${p.workstream.toLowerCase()} rounded`}>
                    {p.workstream} WORKSTREAM
                  </span>
                  <span className="text-status-critical text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      warning
                    </span>
                    CRITICAL
                  </span>
                </div>
                <h4 className="font-bold text-on-surface mb-1">{p.name}</h4>
                <p className="text-sm text-on-surface-variant mb-4">{p.blockers[0]?.detail}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">Owner: {p.owner}</span>
                  <span className="font-mono text-xs text-status-critical bg-status-critical/5 px-2 py-1 rounded">
                    Day {p.blockers[0]?.ago} of stagnation
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
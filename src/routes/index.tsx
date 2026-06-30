import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { projects, workstreamLabel, type Workstream } from "@/data/projects";
import { updates as newsUpdates } from "@/data/newsletter";
import { relativeTime } from "@/lib/time";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard | Supply Chain Tech Hub" },
      {
        name: "description",
        content: "Real-time performance metrics across strategic workstreams: portfolio health, sprint load, blockers, and milestones.",
      },
      { property: "og:title", content: "Executive Dashboard | Supply Chain Tech Hub" },
      { property: "og:description", content: "Executive oversight of portfolio health, sprint load, and blockers." },
    ],
  }),
  component: Dashboard,
});

const kpis = [
  { label: "Total Projects", value: "142", accent: "primary", chart: "line-flat" },
  { label: "Active Projects", value: "84", accent: "status-low", chart: "line-up" },
  { label: "In Current Sprint", value: "32", accent: "secondary", chart: "bars" },
  { label: "Open Blockers", value: "7", accent: "status-critical", chart: "zigzag", note: "+2 this week", critical: true },
  { label: "High Priority", value: "12", accent: "status-high", chart: "bar-fill" },
  { label: "Avg. Delivery", value: "14d", accent: "on-surface", chart: "stat" },
];

const workstreams: { key: Workstream | "ALL"; count: number }[] = [
  { key: "ALL", count: 142 },
  { key: "OX", count: 42 },
  { key: "EX", count: 18 },
  { key: "AU", count: 24 },
  { key: "DW", count: 58 },
];

function Sparkline({ kind, accent }: { kind: string; accent: string }) {
  const stroke = `text-${accent}`;
  if (kind === "line-flat")
    return (
      <svg viewBox="0 0 100 20" className={`w-full h-full ${stroke} opacity-40`}>
        <path d="M0,10 Q25,0 50,10 T100,5" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  if (kind === "line-up")
    return (
      <svg viewBox="0 0 100 20" className={`w-full h-full ${stroke}`}>
        <path d="M0,15 L20,10 L40,12 L60,5 L80,8 L100,2" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  if (kind === "bars")
    return (
      <svg viewBox="0 0 60 20" className={`w-full h-full ${stroke}`}>
        <rect x="0" y="10" width="10" height="10" fill="currentColor" opacity="0.3" />
        <rect x="15" y="5" width="10" height="15" fill="currentColor" opacity="0.5" />
        <rect x="30" y="12" width="10" height="8" fill="currentColor" opacity="0.7" />
        <rect x="45" y="2" width="10" height="18" fill="currentColor" />
      </svg>
    );
  if (kind === "zigzag")
    return (
      <svg viewBox="0 0 100 20" className={`w-full h-full ${stroke}`}>
        <path
          d="M0,5 L10,15 L20,5 L30,15 L40,5 L50,15 L60,5 L70,15 L80,5 L90,15 L100,5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  if (kind === "bar-fill")
    return (
      <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
        <div className={`h-full bg-${accent} w-[40%]`} />
      </div>
    );
  return (
    <div className="flex justify-between items-center text-[10px] font-mono">
      <span className="text-status-low">Efficiency 92%</span>
      <span className="text-on-surface-variant">Q4 Target</span>
    </div>
  );
}

function KpiCard({ kpi }: { kpi: (typeof kpis)[number] }) {
  return (
    <div
      className={`bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors ${
        kpi.critical ? "border-l-4 border-l-status-critical" : ""
      }`}
    >
      <div>
        <p
          className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${
            kpi.critical ? "text-status-critical" : "text-on-surface-variant"
          }`}
        >
          {kpi.label}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className={`text-3xl font-black text-${kpi.accent === "on-surface" ? "on-surface" : kpi.accent}`}>
            {kpi.value}
          </h3>
          {kpi.note && <span className="text-xs font-bold text-status-critical">{kpi.note}</span>}
        </div>
      </div>
      <div className="mt-4 h-8 w-full">
        <Sparkline kind={kpi.chart} accent={kpi.accent} />
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  const ws = project.workstream;
  const prioColor =
    project.priority === "High" || project.priority === "Critical"
      ? "status-critical"
      : project.priority === "Medium"
      ? "status-medium"
      : "status-low";
  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded bg-workstream-${ws.toLowerCase()}/10 text-workstream-${ws.toLowerCase()} text-[10px] font-bold uppercase`}>
              Workstream: {ws}
            </span>
            <span className={`px-2 py-1 rounded bg-${prioColor}/10 text-${prioColor} text-[10px] font-bold uppercase`}>
              {project.priority} Priority
            </span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container rounded p-1">
            more_vert
          </span>
        </div>
        <div>
          <h4 className="text-lg font-bold text-on-surface">{project.name}</h4>
          <p className="text-on-surface-variant text-sm mt-1">{project.description}</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-on-surface-variant">{project.progressLabel}</span>
            <span className="text-on-surface">{project.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div className={`h-full bg-workstream-${ws.toLowerCase()}`} style={{ width: `${project.progress}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {project.team.map((src, i) => (
              <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-surface-card object-cover" />
            ))}
            {project.team.length < 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-surface-card bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                +{Math.max(1, 4 - project.team.length)}
              </div>
            )}
          </div>
          {project.sprint && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-container-low rounded-lg border border-border-subtle">
              <span className="material-symbols-outlined text-sm text-secondary">flag</span>
              <span className="text-[10px] font-bold text-on-surface uppercase">{project.sprint}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-auto border-t border-border-subtle p-4 bg-surface-container-lowest flex justify-between items-center">
        <div className="flex gap-2 opacity-60 text-on-surface-variant">
          <span className="material-symbols-outlined text-xl">database</span>
          <span className="material-symbols-outlined text-xl">api</span>
          <span className="material-symbols-outlined text-xl">bar_chart</span>
        </div>
        <Link
          to="/portfolio/$projectId"
          params={{ projectId: project.id }}
          className="bg-primary-fixed text-on-primary-fixed hover:bg-primary hover:text-white px-4 py-1.5 rounded text-xs font-medium transition-all"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function Dashboard() {
  const [range, setRange] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [activeWs, setActiveWs] = useState<Workstream | "ALL">("ALL");
  const filtered = activeWs === "ALL" ? projects : projects.filter((p) => p.workstream === activeWs);
  const featured = filtered.slice(0, 3);
  const expansion = projects.find((p) => p.id === "global-expansion");

  return (
    <AppShell>
      <div className="px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-4xl font-black text-on-surface">Executive Overview</h2>
            <p className="text-on-surface-variant text-base mt-1">
              Real-time performance metrics across strategic workstreams.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container p-1 rounded-lg">
            {(["Daily", "Weekly", "Monthly"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                  range === r
                    ? "bg-surface-card shadow-sm text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-on-surface">Portfolio Distribution</h3>
            <button className="text-primary text-xs font-medium flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-sm">tune</span>
              Advanced Filters
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {workstreams.map((w) => {
              const active = activeWs === w.key;
              const label = w.key === "ALL" ? "All Workstreams" : workstreamLabel[w.key];
              const colorClass = w.key === "ALL" ? "primary" : `workstream-${w.key.toLowerCase()}`;
              return (
                <button
                  key={w.key}
                  onClick={() => setActiveWs(w.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    active
                      ? `bg-${colorClass} text-white shadow-lg`
                      : "bg-surface-card border border-border-subtle text-on-surface hover:border-primary"
                  }`}
                >
                  {w.key !== "ALL" && <span className={`w-2 h-2 rounded-full bg-${colorClass}`} />}
                  {label}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      active ? "bg-white/20" : "bg-surface-container"
                    }`}
                  >
                    {w.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {featured.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}

          {expansion && (
            <div className="lg:col-span-2 bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
              <div className="p-6 md:w-2/3 space-y-4">
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded bg-workstream-ex/10 text-workstream-ex text-[10px] font-bold uppercase">
                    Workstream: EX
                  </span>
                  <span className="px-2 py-1 rounded bg-status-high/10 text-status-high text-[10px] font-bold uppercase">
                    Board Critical
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-on-surface">{expansion.name}</h4>
                  <p className="text-on-surface-variant text-sm mt-1">
                    Consolidated strategic plan for Southeast Asian market penetration involving all units.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border-subtle">
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Phases</p>
                    <p className="text-lg font-bold">04 / 12</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Budget Cap</p>
                    <p className="text-lg font-bold">$4.2M</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Impact Score</p>
                    <p className="text-lg font-bold text-status-low">9.8</p>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container-low p-6 md:w-1/3 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border-subtle">
                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Key Milestones</p>
                  <div className="space-y-3">
                    {expansion.timeline.map((t) => (
                      <div key={t.title} className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-sm ${
                            t.complete ? "text-status-low" : "text-on-surface-variant"
                          }`}
                          style={t.complete ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          {t.complete ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span className={`text-xs font-medium ${t.complete ? "text-on-surface" : "text-on-surface-variant"}`}>
                          {t.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link
                  to="/portfolio/$projectId"
                  params={{ projectId: expansion.id }}
                  className="w-full mt-6 bg-surface-card border border-border-subtle text-on-surface hover:bg-primary-fixed transition-colors py-2 rounded text-xs font-medium text-center"
                >
                  Open Strategy Doc
                </Link>
              </div>
            </div>
          )}

          <div className="bg-status-critical/5 border border-status-critical/20 rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-status-critical">warning</span>
              <h4 className="text-lg font-bold text-status-critical">Critical Blockers</h4>
            </div>
            <div className="space-y-4 flex-1">
              <div className="p-3 bg-surface-card border border-border-subtle rounded-lg shadow-sm">
                <p className="text-xs font-bold text-on-surface">API Credentials Pending</p>
                <p className="text-[10px] text-on-surface-variant mt-1">Vendor: Fero Global Systems</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-status-critical font-bold">24h Delay Impact</span>
                  <button className="text-[10px] font-bold text-primary underline">Escalate</button>
                </div>
              </div>
              <div className="p-3 bg-surface-card border border-border-subtle rounded-lg shadow-sm">
                <p className="text-xs font-bold text-on-surface">Server Migration Stall</p>
                <p className="text-[10px] text-on-surface-variant mt-1">Owner: Data Warehouse Unit</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-status-critical font-bold">Risk: High</span>
                  <button className="text-[10px] font-bold text-primary underline">Fix Now</button>
                </div>
              </div>
            </div>
            <Link
              to="/portfolio"
              className="w-full mt-4 bg-status-critical text-white py-2 rounded text-xs font-medium hover:brightness-110 transition-all text-center"
            >
              View All 7 Blockers
            </Link>
          </div>
        </div>

        <section className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">campaign</span>
              <h3 className="text-xl font-bold text-on-surface">Latest from SCM Tech Pulse</h3>
            </div>
            <Link to="/newsletter" className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
              Open Newsletter <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {newsUpdates.slice(0, 3).map((u) => (
              <div key={u.id} className="border border-border-subtle rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-workstream-${u.workstream.toLowerCase()}/10 text-workstream-${u.workstream.toLowerCase()}`}>
                    {u.workstream}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">{relativeTime(u.publishedAt)}</span>
                </div>
                <p className="font-bold text-sm text-on-surface line-clamp-2">{u.title}</p>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{u.summary}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

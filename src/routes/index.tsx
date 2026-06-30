import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { projects, workstreamLabel, workstreamFullName, type Workstream, type Status, type Priority } from "@/data/projects";
import { updates as newsUpdates } from "@/data/newsletter";
import { relativeTime } from "@/lib/time";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Dashboard | Supply Chain Tech Hub" },
      {
        name: "description",
        content:
          "Action-centric command dashboard for Supply Chain tech — major projects, in-flight actions, blockers, sprint load, owner workload, and live updates.",
      },
      { property: "og:title", content: "Command Dashboard | Supply Chain Tech Hub" },
      { property: "og:description", content: "Major projects, actions, blockers, and live updates at a glance." },
    ],
  }),
  component: Dashboard,
});

type Range = "Today" | "This Week" | "This Sprint";

const ALL_WS: (Workstream | "ALL")[] = ["ALL", "OX", "EX", "AU", "DW"];

const statusOrder: Status[] = ["On Track", "In Progress", "Blocked", "Delayed", "Completed"];

function clsAccent(accent: string) {
  // returns text- and bg- helpers given a token name
  return {
    text: `text-${accent}`,
    bg: `bg-${accent}`,
    soft: `bg-${accent}/10`,
    border: `border-${accent}/30`,
  };
}

function KpiTile({
  label,
  value,
  accent,
  icon,
  delta,
  hint,
  critical,
}: {
  label: string;
  value: number | string;
  accent: string;
  icon: string;
  delta?: { value: string; positive?: boolean };
  hint?: string;
  critical?: boolean;
}) {
  const a = clsAccent(accent);
  return (
    <div
      className={`bg-surface-card border border-border-subtle rounded-xl p-5 shadow-sm flex flex-col gap-4 transition-all hover:border-primary/40 hover:shadow-md ${
        critical ? "border-l-4 border-l-status-critical" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.soft}`}>
          <span className={`material-symbols-outlined ${a.text}`}>{icon}</span>
        </div>
        {delta && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              delta.positive ? "bg-status-low/10 text-status-low" : "bg-status-critical/10 text-status-critical"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {delta.positive ? "trending_up" : "trending_down"}
            </span>
            {delta.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
        <p className={`text-4xl font-black font-mono mt-1 tracking-tight ${critical ? "text-status-critical" : "text-on-surface"}`}>{value}</p>
        {hint && <p className="text-[11px] text-on-surface-variant mt-1">{hint}</p>}
      </div>
    </div>
  );
}

function StatusBar({ counts, total }: { counts: Record<Status, number>; total: number }) {
  const segs: { status: Status; color: string }[] = [
    { status: "Completed", color: "bg-status-low" },
    { status: "On Track", color: "bg-workstream-au" },
    { status: "In Progress", color: "bg-primary" },
    { status: "Delayed", color: "bg-status-high" },
    { status: "Blocked", color: "bg-status-critical" },
  ];
  return (
    <div>
      <div className="flex w-full h-3 rounded-full overflow-hidden bg-surface-container">
        {segs.map((s) => {
          const pct = total ? (counts[s.status] / total) * 100 : 0;
          if (!pct) return null;
          return <div key={s.status} className={s.color} style={{ width: `${pct}%` }} title={`${s.status}: ${counts[s.status]}`} />;
        })}
      </div>
      <div className="flex flex-wrap gap-4 mt-4">
        {segs.map((s) => (
          <div key={s.status} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
            <span className="text-xs text-on-surface-variant">{s.status}</span>
            <span className="text-xs font-bold text-on-surface">{counts[s.status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const [range, setRange] = useState<Range>("This Sprint");
  const [activeWs, setActiveWs] = useState<Workstream | "ALL">("ALL");
  const [avgMode, setAvgMode] = useState<"simple" | "weighted">("simple");

  const scoped = activeWs === "ALL" ? projects : projects.filter((p) => p.workstream === activeWs);
  const allTasks = scoped.flatMap((p) => p.tasks);

  const metrics = useMemo(() => {
    const total = scoped.length;
    const totalActions = allTasks.length;
    const inProgress = allTasks.filter((t) => t.status === "In Progress").length;
    const completed = allTasks.filter((t) => t.status === "Completed").length;
    const blocked = scoped.filter((p) => p.status === "Blocked").length + allTasks.filter((t) => t.status === "Blocked").length;
    const highPriority = scoped.filter((p) => p.priority === "Critical" || p.priority === "High").length;
    const inSprint = allTasks.filter((t) => t.inSprint).length;
    const activeSprints = new Set(scoped.map((p) => p.sprint).filter(Boolean)).size;
    const avgProgressSimple = scoped.length
      ? Math.round(scoped.reduce((n, p) => n + p.progress, 0) / scoped.length)
      : 0;
    const totalWeight = scoped.reduce((n, p) => n + p.tasks.length, 0);
    const avgProgressWeighted = totalWeight
      ? Math.round(scoped.reduce((n, p) => n + p.progress * p.tasks.length, 0) / totalWeight)
      : avgProgressSimple;

    const statusCounts = statusOrder.reduce<Record<Status, number>>(
      (acc, s) => {
        acc[s] = scoped.filter((p) => p.status === s).length;
        return acc;
      },
      { "On Track": 0, "In Progress": 0, Blocked: 0, Delayed: 0, Completed: 0 }
    );

    const byWorkstream = (["OX", "EX", "AU", "DW"] as Workstream[]).map((ws) => {
      const ps = projects.filter((p) => p.workstream === ws);
      const tasks = ps.flatMap((p) => p.tasks);
      return {
        ws,
        projects: ps.length,
        actions: tasks.length,
        progress: ps.length ? Math.round(ps.reduce((n, p) => n + p.progress, 0) / ps.length) : 0,
        blockers: ps.filter((p) => p.status === "Blocked").length,
      };
    });

    const priorityCounts = (["Critical", "High", "Medium", "Low"] as Priority[]).map((p) => ({
      p,
      count: scoped.filter((x) => x.priority === p).length,
    }));

    // Owner workload (currently with)
    const ownerMap = new Map<string, { name: string; initials: string; actions: number; blocked: number }>();
    for (const t of allTasks) {
      const key = t.currentlyWith.name;
      const cur = ownerMap.get(key) ?? { name: t.currentlyWith.name, initials: t.currentlyWith.initials, actions: 0, blocked: 0 };
      cur.actions += 1;
      if (t.status === "Blocked") cur.blocked += 1;
      ownerMap.set(key, cur);
    }
    const owners = Array.from(ownerMap.values()).sort((a, b) => b.actions - a.actions).slice(0, 5);

    return {
      total,
      totalActions,
      inProgress,
      completed,
      blocked,
      highPriority,
      inSprint,
      activeSprints,
      avgProgressSimple,
      avgProgressWeighted,
      statusCounts,
      byWorkstream,
      priorityCounts,
      owners,
    };
  }, [scoped, allTasks]);

  const avgProgress = avgMode === "simple" ? metrics.avgProgressSimple : metrics.avgProgressWeighted;

  const upcoming = useMemo(() => {
    return scoped
      .flatMap((p) => p.timeline.filter((t) => !t.complete).map((t) => ({ p, t })))
      .slice(0, 5);
  }, [scoped]);

  const recentBlockers = scoped.flatMap((p) => p.blockers.map((b) => ({ p, ...b }))).slice(0, 3);
  const liveTasks = allTasks
    .slice()
    .sort((a, b) => new Date(b.latestUpdate.at).getTime() - new Date(a.latestUpdate.at).getTime())
    .slice(0, 5);

  return (
    <AppShell>
      <div className="px-8 py-8 space-y-8 pb-24">
        {/* Header */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">Command Dashboard</p>
            <h1 className="text-3xl sm:text-4xl font-black text-on-surface mt-1">Supply Chain Tech Hub</h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Action-centric oversight across major projects, sprints, blockers and owner workload.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container p-1 rounded-lg shrink-0">
            {(["Today", "This Week", "This Sprint"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  range === r
                    ? "bg-surface-card shadow-sm text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </header>

        {/* Workstream filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mr-1">Workstream</span>
          {ALL_WS.map((ws) => {
            const active = activeWs === ws;
            const label = ws === "ALL" ? "All Workstreams" : workstreamFullName[ws];
            const color = ws === "ALL" ? "primary" : `workstream-${ws.toLowerCase()}`;
            const count =
              ws === "ALL" ? projects.length : projects.filter((p) => p.workstream === ws).length;
            return (
              <button
                key={ws}
                onClick={() => setActiveWs(ws)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  active
                    ? `bg-${color} text-white shadow-md`
                    : "bg-surface-card border border-border-subtle text-on-surface hover:border-primary"
                }`}
              >
                {ws !== "ALL" && (
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${active ? "bg-white/20" : `bg-${color}/10 text-${color}`}`}>
                    {ws}
                  </span>
                )}
                <span>{label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? "bg-white/20" : "bg-surface-container"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Primary KPI strip — action-centric */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiTile
            label="Major Projects"
            value={metrics.total}
            accent="primary"
            icon="hub"
            hint={`${metrics.activeSprints} active sprints`}
          />
          <KpiTile
            label="Total Actions"
            value={metrics.totalActions}
            accent="secondary"
            icon="checklist"
            hint={`${metrics.inSprint} in current sprint`}
          />
          <KpiTile
            label="In Progress"
            value={metrics.inProgress}
            accent="workstream-ox"
            icon="autorenew"
            delta={{ value: "+4", positive: true }}
          />
          <KpiTile
            label="Completed"
            value={metrics.completed}
            accent="status-low"
            icon="task_alt"
            hint="this cycle"
          />
          <KpiTile
            label="High Priority"
            value={metrics.highPriority}
            accent="status-high"
            icon="priority_high"
            hint="Critical + High"
          />
          <KpiTile
            label="Open Blockers"
            value={metrics.blocked}
            accent="status-critical"
            icon="report"
            critical
            delta={{ value: "+2", positive: false }}
          />
        </section>

        {/* Portfolio health + Priority mix */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Portfolio Health</h3>
                <p className="text-xs text-on-surface-variant">Project status distribution · {metrics.total} projects in scope</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Avg Project Completion
                  </p>
                  <span
                    className="material-symbols-outlined text-[14px] text-on-surface-variant cursor-help"
                    title={
                      avgMode === "simple"
                        ? "Simple average: mean of each project's % complete in scope. Every project counted equally."
                        : "Weighted average: each project's % complete weighted by its number of actions. Bigger projects move the needle more."
                    }
                  >
                    info
                  </span>
                </div>
                <p className="text-2xl font-black text-primary font-mono">{avgProgress}%</p>
                <div className="inline-flex bg-surface-container p-0.5 rounded-md mt-1 text-[10px] font-bold">
                  {(["simple", "weighted"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setAvgMode(m)}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        avgMode === m ? "bg-surface-card text-primary shadow-sm" : "text-on-surface-variant"
                      }`}
                    >
                      {m === "simple" ? "Simple" : "Weighted"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <StatusBar counts={metrics.statusCounts} total={metrics.total} />

            <div className="mt-6 pt-6 border-t border-border-subtle">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Workstream Performance
                </p>
                <p className="text-[10px] text-on-surface-variant">progress · open actions · blockers</p>
              </div>
              <div className="space-y-4">
                {metrics.byWorkstream.map((w) => (
                  <div key={w.ws} className="flex items-center gap-4">
                    <div className="w-56 shrink-0 flex items-center gap-2">
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-workstream-${w.ws.toLowerCase()}/10 text-workstream-${w.ws.toLowerCase()}`}
                      >
                        {w.ws}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate">{workstreamFullName[w.ws]}</p>
                        <p className="text-[10px] text-on-surface-variant">
                          {w.projects} projects · {w.actions} actions
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-workstream-${w.ws.toLowerCase()}`}
                        style={{ width: `${w.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-on-surface w-10 text-right font-bold">{w.progress}%</span>
                    {w.blockers > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-status-critical/10 text-status-critical text-[10px] font-bold whitespace-nowrap">
                        {w.blockers} blocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-status-low/10 text-status-low text-[10px] font-bold whitespace-nowrap">
                        clear
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-on-surface mb-1">Action Priority Mix</h3>
            <p className="text-xs text-on-surface-variant mb-4">Across {metrics.total} projects in scope</p>
            <div className="space-y-3 flex-1">
              {metrics.priorityCounts.map(({ p, count }) => {
                const color =
                  p === "Critical" || p === "High"
                    ? "status-critical"
                    : p === "Medium"
                    ? "status-medium"
                    : "status-low";
                const pct = metrics.total ? (count / metrics.total) * 100 : 0;
                return (
                  <div key={p}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full bg-${color}`} />
                        <span className="font-medium text-on-surface">{p}</span>
                      </span>
                      <span className="font-bold text-on-surface">{count}</span>
                    </div>
                    <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full bg-${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              to="/portfolio"
              className="mt-4 w-full bg-primary-fixed text-on-primary-fixed text-xs font-bold py-2 rounded-lg text-center hover:bg-primary hover:text-white transition-colors"
            >
              Open Portfolio
            </Link>
          </div>
        </section>

        {/* Live actions + Owner workload + Blockers */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live actions feed */}
          <div className="lg:col-span-2 bg-surface-card border border-border-subtle rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bolt</span>
                <h3 className="text-lg font-bold text-on-surface">Live Actions Feed</h3>
              </div>
              <Link to="/portfolio" className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                All actions <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <ul className="divide-y divide-border-subtle">
              {liveTasks.map((t) => {
                const owner = scoped.find((p) => p.tasks.some((tt) => tt.id === t.id));
                const statusColor =
                  t.status === "Blocked"
                    ? "status-critical"
                    : t.status === "Delayed"
                    ? "status-high"
                    : t.status === "Completed"
                    ? "status-low"
                    : t.status === "In Progress"
                    ? "primary"
                    : "workstream-au";
                return (
                  <li key={t.id} className="px-6 py-4 hover:bg-surface-container-lowest transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                        <span className={`w-2 h-2 rounded-full bg-${statusColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-[10px] text-on-surface-variant">{t.id}</span>
                          {owner && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-workstream-${owner.workstream.toLowerCase()}/10 text-workstream-${owner.workstream.toLowerCase()}`}
                            >
                              {owner.workstream}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold bg-${statusColor}/10 text-${statusColor}`}>
                            {t.status}
                          </span>
                          {t.inSprint && t.sprint && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-container text-on-surface-variant">
                              {t.sprint}
                            </span>
                          )}
                          <span className="text-[11px] text-on-surface-variant ml-auto">{relativeTime(t.latestUpdate.at)}</span>
                        </div>
                        <p className="text-sm font-medium text-on-surface truncate">{t.name}</p>
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">{t.latestUpdate.text}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            {t.currentlyWith.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">engineering</span>
                            Tech: {t.techOwner.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">business_center</span>
                            Biz: {t.businessOwner.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
              {liveTasks.length === 0 && (
                <li className="px-6 py-12 text-center text-sm text-on-surface-variant">No live actions in this scope.</li>
              )}
            </ul>
          </div>

          {/* Owner workload */}
          <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">groups</span>
                <h3 className="text-lg font-bold text-on-surface">Owner Workload</h3>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">Top owners by open actions</p>
            <div className="space-y-3">
              {metrics.owners.map((o) => {
                const max = metrics.owners[0]?.actions || 1;
                return (
                  <div key={o.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-[11px] font-bold shrink-0">
                      {o.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-on-surface truncate">{o.name}</span>
                        <span className="font-bold text-on-surface">{o.actions}</span>
                      </div>
                      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-primary" style={{ width: `${(o.actions / max) * 100}%` }} />
                      </div>
                      {o.blocked > 0 && (
                        <p className="text-[10px] text-status-critical font-bold mt-1">
                          {o.blocked} blocked
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Blockers + Upcoming milestones */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-status-critical/5 border border-status-critical/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-status-critical">warning</span>
                <h3 className="text-lg font-bold text-status-critical">Critical Blockers</h3>
              </div>
              <span className="text-xs font-bold text-status-critical">{metrics.blocked} open</span>
            </div>
            <div className="space-y-3">
              {recentBlockers.length === 0 && (
                <p className="text-sm text-on-surface-variant">No active blockers in this scope. </p>
              )}
              {recentBlockers.map((b, i) => (
                <div key={i} className="p-4 bg-surface-card border border-border-subtle rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface">{b.title}</p>
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{b.detail}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-workstream-${b.p.workstream.toLowerCase()}/10 text-workstream-${b.p.workstream.toLowerCase()}`}
                        >
                          {b.p.workstream}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">{b.p.name}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-status-critical whitespace-nowrap">{b.ago}</span>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Link
                      to="/portfolio/$projectId"
                      params={{ projectId: b.p.id }}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Open project →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">event_upcoming</span>
                <h3 className="text-lg font-bold text-on-surface">Upcoming Milestones</h3>
              </div>
              <Link to="/roadmap" className="text-xs text-primary font-bold hover:underline">Roadmap →</Link>
            </div>
            <ol className="relative border-l border-border-subtle ml-2 space-y-4">
              {upcoming.map(({ p, t }, i) => (
                <li key={`${p.id}-${i}`} className="pl-5 relative">
                  <span
                    className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-workstream-${p.workstream.toLowerCase()} ring-4 ring-surface-card`}
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-on-surface-variant">{t.date}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-workstream-${p.workstream.toLowerCase()}/10 text-workstream-${p.workstream.toLowerCase()}`}
                    >
                      {p.workstream}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-on-surface mt-1">{t.title}</p>
                  {t.detail && <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{t.detail}</p>}
                  <Link
                    to="/portfolio/$projectId"
                    params={{ projectId: p.id }}
                    className="text-[11px] text-primary font-bold hover:underline mt-1 inline-block"
                  >
                    {p.name} →
                  </Link>
                </li>
              ))}
              {upcoming.length === 0 && (
                <li className="pl-5 text-sm text-on-surface-variant">No upcoming milestones.</li>
              )}
            </ol>
          </div>
        </section>

        {/* SCM Pulse */}
        <section className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">campaign</span>
              <h3 className="text-lg font-bold text-on-surface">Latest from SCM Tech Pulse</h3>
            </div>
            <Link to="/newsletter" className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
              Open Newsletter <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {newsUpdates.slice(0, 3).map((u) => (
              <Link
                key={u.id}
                to="/newsletter"
                className="border border-border-subtle rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all block"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-workstream-${u.workstream.toLowerCase()}/10 text-workstream-${u.workstream.toLowerCase()}`}
                  >
                    {u.workstream}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">{relativeTime(u.publishedAt)}</span>
                </div>
                <p className="font-bold text-sm text-on-surface line-clamp-2">{u.title}</p>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{u.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Link
        to="/import"
        className="fixed bottom-8 right-8 z-30 bg-primary text-white w-14 h-14 rounded-full shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Quick import"
      >
        <span className="material-symbols-outlined">add</span>
      </Link>
    </AppShell>
  );
}
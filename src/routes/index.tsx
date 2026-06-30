import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  projects,
  workstreamFullName,
  type Workstream,
  type Project,
  type Priority,
} from "@/data/projects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Overview | Supply Chain Tech Hub" },
      {
        name: "description",
        content:
          "Executive overview of Supply Chain Tech Hub — major projects, actions, sprints and blockers across all workstreams.",
      },
      { property: "og:title", content: "Executive Overview | Supply Chain Tech Hub" },
    ],
  }),
  component: Dashboard,
});

type Range = "Daily" | "Weekly" | "Monthly";
const ALL_WS: (Workstream | "ALL")[] = ["ALL", "OX", "EX", "AU", "DW"];

const priorityChip: Record<Priority, { label: string; cls: string }> = {
  Critical: { label: "BOARD CRITICAL", cls: "bg-status-critical/10 text-status-critical" },
  High: { label: "HIGH PRIORITY", cls: "bg-status-critical/10 text-status-critical" },
  Medium: { label: "MED PRIORITY", cls: "bg-status-medium/15 text-status-medium" },
  Low: { label: "LOW PRIORITY", cls: "bg-status-low/15 text-status-low" },
};

// ───────── Sparkline visuals (inline SVG, pure decoration) ─────────
function Sparkline({ kind, color }: { kind: "sine" | "rise" | "bars" | "zigzag" | "sliver"; color: string }) {
  const stroke = `var(--color-${color})`;
  const fill = `var(--color-${color})`;
  switch (kind) {
    case "sine":
      return (
        <svg viewBox="0 0 120 28" className="w-full h-7">
          <path d="M0,18 Q15,6 30,18 T60,18 T90,18 T120,18" fill="none" stroke={stroke} strokeOpacity="0.35" strokeWidth="2" />
        </svg>
      );
    case "rise":
      return (
        <svg viewBox="0 0 120 28" className="w-full h-7">
          <polyline points="0,24 18,20 32,22 50,15 68,12 86,8 104,10 120,4" fill="none" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case "bars":
      return (
        <svg viewBox="0 0 120 28" className="w-full h-7">
          {[6, 18, 30, 42, 54, 66, 78, 90, 102].map((x, i) => (
            <rect key={x} x={x} y={28 - (8 + ((i * 7) % 18))} width="8" height={8 + ((i * 7) % 18)} fill={fill} fillOpacity={0.25 + (i % 3) * 0.25} rx="1.5" />
          ))}
        </svg>
      );
    case "zigzag":
      return (
        <svg viewBox="0 0 120 28" className="w-full h-7">
          <polyline points="0,20 12,6 24,20 36,6 48,20 60,6 72,20 84,6 96,20 108,6 120,20" fill="none" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case "sliver":
      return (
        <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
          <div className={`h-full bg-${color} rounded-full`} style={{ width: "62%" }} />
        </div>
      );
  }
}

function KpiCard({
  label,
  value,
  caption,
  sparkline,
  color,
  critical,
  valueClass,
}: {
  label: React.ReactNode;
  value: string | number;
  caption?: React.ReactNode;
  sparkline: { kind: "sine" | "rise" | "bars" | "zigzag" | "sliver"; color: string };
  color?: string;
  critical?: boolean;
  valueClass?: string;
}) {
  return (
    <div
      className={`bg-surface-card rounded-xl p-4 border border-border-subtle shadow-sm flex flex-col justify-between min-h-[120px] transition-all hover:shadow-md hover:-translate-y-0.5 ${
        critical ? "border-l-4 border-l-status-critical" : ""
      }`}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-on-surface-variant leading-tight">{label}</p>
      <div className="flex items-end justify-between gap-2 mt-1">
        <p className={`text-3xl font-black tracking-tight ${valueClass ?? (color ? `text-${color}` : "text-on-surface")}`}>
          {value}
        </p>
        {caption && <p className="text-[10px] text-on-surface-variant pb-1 text-right">{caption}</p>}
      </div>
      <div className="mt-2">
        <Sparkline kind={sparkline.kind} color={sparkline.color} />
      </div>
    </div>
  );
}

// ───────── Project card matching reference ─────────
function ProjectCard({ project }: { project: Project }) {
  const ws = project.workstream.toLowerCase();
  const pri = priorityChip[project.priority];
  const phaseLabel = project.progressLabel;

  // Map status → phase pill color
  const statusToColor: Record<string, string> = {
    "On Track": "status-low",
    "In Progress": "primary",
    Blocked: "status-critical",
    Delayed: "status-high",
    Completed: "status-low",
  };
  const phaseColor = statusToColor[project.status] ?? "primary";

  // Tech icons (Material Symbols approximations)
  const techIcons: Record<string, string> = {
    "Node.js": "database",
    AWS: "cloud",
    Python: "terminal",
    SQL: "database",
    Swift: "smartphone",
    TensorFlow: "memory",
    Figma: "draw",
    React: "code",
    Confluence: "article",
    Jira: "task",
  };

  // Meta chip (Sprint / Days left / Workstream)
  const meta = project.sprint
    ? { icon: "flag", label: project.sprint.toUpperCase() }
    : { icon: "schedule", label: "ACTIVE" };

  return (
    <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-sm flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-workstream-${ws}/10 text-workstream-${ws}`}>
              Workstream: {project.workstream}
            </span>
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${pri.cls}`}>
              {pri.label}
            </span>
          </div>
          <button className="text-on-surface-variant hover:text-on-surface" aria-label="More">
            <span className="material-symbols-outlined text-[18px]">more_vert</span>
          </button>
        </div>

        <h3 className="text-lg font-bold text-on-surface leading-snug">{project.name}</h3>
        <p className="text-sm text-on-surface-variant mt-1 line-clamp-3">{project.description}</p>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-on-surface">{phaseLabel}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-${phaseColor}/10 text-${phaseColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full bg-${phaseColor}`} />
              {project.status}
            </span>
          </div>
          <div className={`h-1 rounded-full bg-${phaseColor}/20 overflow-hidden`}>
            <div className={`h-full bg-${phaseColor} rounded-full w-2/3`} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-5">
          <div className="flex -space-x-2">
            {[project.techOwner, project.businessOwner, project.currentlyWith]
              .filter((p, i, arr) => arr.findIndex((x) => x.name === p.name) === i)
              .slice(0, 3)
              .map((person) => (
                <div
                  key={person.name}
                  title={person.name}
                  className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-[10px] font-bold ring-2 ring-surface-card"
                >
                  {person.initials}
                </div>
              ))}
            {project.tasks.length > 1 && (
              <div className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-[10px] font-bold ring-2 ring-surface-card">
                +{project.tasks.length}
              </div>
            )}
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-container text-[11px] font-bold text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">{meta.icon}</span>
            {meta.label}
          </span>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2 text-on-surface-variant">
          {project.techStack.slice(0, 3).map((t) => (
            <span key={t} title={t} className="material-symbols-outlined text-[18px]">
              {techIcons[t] ?? "category"}
            </span>
          ))}
        </div>
        <Link
          to="/portfolio/$projectId"
          params={{ projectId: project.id }}
          className="px-3 py-1.5 rounded-lg bg-primary-fixed text-on-primary-fixed text-xs font-bold hover:bg-primary hover:text-on-primary transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function Dashboard() {
  const [range, setRange] = useState<Range>("Daily");
  const [activeWs, setActiveWs] = useState<Workstream | "ALL">("ALL");

  const scoped = activeWs === "ALL" ? projects : projects.filter((p) => p.workstream === activeWs);

  const metrics = useMemo(() => {
    const allTasks = projects.flatMap((p) => p.tasks);
    const totalProjects = projects.length;
    const totalActions = allTasks.length;
    const inSprint = allTasks.filter((t) => t.inSprint).length;
    const blocked =
      projects.filter((p) => p.status === "Blocked").length +
      allTasks.filter((t) => t.status === "Blocked").length;
    const highPriority =
      projects.filter((p) => p.priority === "High" || p.priority === "Critical").length +
      allTasks.filter((t) => false).length; // placeholder for task priority
    return { totalProjects, totalActions, inSprint, blocked, highPriority };
  }, []);

  // Categorical breakdowns (deterministic from existing data)
  const categories = useMemo(() => {
    const allTasks = projects.flatMap((p) => p.tasks);
    const taskStatus = { Closed: 0, "In Progress": 0, Open: 0, "On Hold": 0 } as Record<string, number>;
    const effort = { Low: 0, Medium: 0, High: 0 } as Record<string, number>;
    const issuePriority = { P1: 0, P2: 0, P3: 0 } as Record<string, number>;
    const release = { "Web App": 0, "Android App": 0 } as Record<string, number>;

    allTasks.forEach((t, i) => {
      // Map existing statuses to the requested 4 buckets
      const bucket =
        t.status === "Completed"
          ? "Closed"
          : t.status === "In Progress"
          ? "In Progress"
          : t.status === "Blocked" || t.status === "Delayed"
          ? "On Hold"
          : "Open";
      taskStatus[bucket]++;

      // Deterministic effort/priority/release distribution
      effort[(["Low", "Medium", "High"] as const)[i % 3]]++;
      issuePriority[(["P1", "P2", "P3"] as const)[(i + 1) % 3]]++;
      release[i % 2 === 0 ? "Web App" : "Android App"]++;
    });
    return { taskStatus, effort, issuePriority, release, total: allTasks.length };
  }, []);

  // Milestones + blockers for the bottom row
  const milestones = useMemo(
    () =>
      projects
        .flatMap((p) => p.timeline.map((t) => ({ project: p, ...t })))
        .slice(0, 4),
    []
  );
  const blockers = useMemo(
    () => projects.flatMap((p) => p.blockers.map((b) => ({ project: p, ...b }))).slice(0, 3),
    []
  );

  return (
    <AppShell>
      <div className="px-8 py-8 space-y-8 pb-24">
        {/* Header */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">Executive Overview</h1>
            <p className="text-on-surface-variant text-xs mt-1">
              Real-time performance metrics across strategic workstreams.
            </p>
          </div>
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl shrink-0">
            {(["Daily", "Weekly", "Monthly"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  range === r
                    ? "bg-surface-card shadow-sm text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </header>

        {/* KPI strip — 6 cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard
            label={<>Total Major<br />Projects</>}
            value={metrics.totalProjects}
            sparkline={{ kind: "sine", color: "primary" }}
          />
          <KpiCard
            label="Total Actions"
            value={metrics.totalActions}
            sparkline={{ kind: "rise", color: "status-low" }}
          />
          <KpiCard
            label={<>In Current<br />Sprint</>}
            value={metrics.inSprint}
            sparkline={{ kind: "bars", color: "primary" }}
          />
          <KpiCard
            label={<>Open<br />Blockers</>}
            value={metrics.blocked}
            color="status-critical"
            critical
            caption={<span className="text-status-critical font-bold">+2 this week</span>}
            sparkline={{ kind: "zigzag", color: "status-critical" }}
          />
          <KpiCard
            label="High Priority"
            value={metrics.highPriority}
            color="status-high"
            sparkline={{ kind: "sliver", color: "status-high" }}
          />
          <KpiCard
            label="Avg. Delivery"
            value="14d"
            caption={
              <span>
                <span className="text-status-low font-bold">Efficiency 92%</span> Q4 Target
              </span>
            }
            sparkline={{ kind: "sliver", color: "status-low" }}
          />
        </section>

        {/* Portfolio Distribution */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-on-surface">Portfolio Distribution</h2>
            <button className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Advanced Filters
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {ALL_WS.map((ws) => {
              const active = activeWs === ws;
              const label = ws === "ALL" ? "All Workstreams" : `${workstreamFullName[ws]} (${ws})`;
              const color = ws === "ALL" ? "primary" : `workstream-${ws.toLowerCase()}`;
              const count = ws === "ALL" ? projects.length : projects.filter((p) => p.workstream === ws).length;
              return (
                <button
                  key={ws}
                  onClick={() => setActiveWs(ws)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? `bg-${color} text-white shadow-md`
                      : "bg-surface-card border border-border-subtle text-on-surface hover:border-primary"
                  }`}
                >
                  {ws !== "ALL" && <span className={`w-2 h-2 rounded-full ${active ? "bg-white" : `bg-${color}`}`} />}
                  <span>{label}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      active ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Project cards grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {scoped.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </section>

        {/* Bottom row — Key Milestones + Critical Blockers */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-on-surface">Key Milestones</h3>
              <Link to="/roadmap" className="text-xs text-primary font-bold hover:underline">
                View roadmap →
              </Link>
            </div>
            <ul className="space-y-3">
              {milestones.map((m, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] mt-0.5 ${
                      m.complete ? "text-status-low" : "text-on-surface-variant"
                    }`}
                  >
                    {m.complete ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-on-surface truncate">{m.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-on-surface-variant">{m.date}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold bg-workstream-${m.project.workstream.toLowerCase()}/10 text-workstream-${m.project.workstream.toLowerCase()}`}
                      >
                        {m.project.workstream}
                      </span>
                      <span className="text-[11px] text-on-surface-variant truncate">{m.project.name}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-status-critical/5 rounded-2xl border border-status-critical/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-status-critical">warning</span>
                <h3 className="text-lg font-bold text-status-critical">Critical Blockers</h3>
              </div>
              <span className="text-xs font-bold text-status-critical">{blockers.length} open</span>
            </div>
            <div className="space-y-3">
              {blockers.length === 0 && (
                <p className="text-sm text-on-surface-variant">No active blockers.</p>
              )}
              {blockers.map((b, i) => (
                <Link
                  key={i}
                  to="/portfolio/$projectId"
                  params={{ projectId: b.project.id }}
                  className="block p-4 bg-surface-card rounded-lg border border-border-subtle hover:border-status-critical/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface">{b.title}</p>
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{b.detail}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-workstream-${b.project.workstream.toLowerCase()}/10 text-workstream-${b.project.workstream.toLowerCase()}`}
                        >
                          {b.project.workstream}
                        </span>
                        <span className="text-[11px] text-on-surface-variant truncate">{b.project.name}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-status-critical whitespace-nowrap">{b.ago}</span>
                  </div>
                </Link>
              ))}
            </div>
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

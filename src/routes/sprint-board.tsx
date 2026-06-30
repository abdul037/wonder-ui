import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useIsAdmin } from "@/lib/admin";

export const Route = createFileRoute("/sprint-board")({
  head: () => ({
    meta: [
      { title: "Sprint Board | Supply Chain Tech Hub" },
      { name: "description", content: "Kanban view of Sprint 24 — Core Infrastructure Q3 across backlog, prioritized, in-sprint, in-progress and done." },
      { property: "og:title", content: "Sprint Board | Supply Chain Tech Hub" },
      { property: "og:description", content: "Kanban view of the active sprint across the engineering workstreams." },
    ],
  }),
  component: SprintBoard,
});

type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Task = {
  id: string;
  title: string;
  project: string;
  priority: Priority;
  tag: { label: string; color: "ox" | "ex" | "au" | "dw" };
  stack: { icon: string; label: string };
  date: string;
  avatar: string;
  progress?: number;
};

const sprintAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuALRmlhYXn8zmT0vffm-jckEhQMn6RS0AimUHTlZSxUyQYFTK0RZNMoSlnElhETygUU7CvIMfNbgoPit9kp-GcVSqtJ2t-9reg2t4PY0pn4_p5T2A53H4Jqx4s1VHICME3NBSIp_cbWmRBl4eHbg9wYw9y7YQrcALTZ2sWqzFWaw-Dfg338krim8-afeEiW95M6NgTzCqvst-qmufpCe8gyi4oaynZJGgEd2RFZk0FaK-KPyfBndAuND2cFSfdQWzT7NrwSklu3ogjM";

type Column = { key: string; title: string; dot: string; count: number; accent?: string; tasks: Task[] };

const columns: Column[] = [
  {
    key: "backlog",
    title: "Backlog",
    dot: "bg-outline",
    count: 12,
    tasks: [
      {
        id: "#ENH-4092",
        title: "Implement multi-factor authentication for admin dashboard",
        project: "Security Shield",
        priority: "LOW",
        tag: { label: "Identity", color: "ox" },
        stack: { icon: "code", label: "React" },
        date: "Sep 28",
        avatar: sprintAvatar,
      },
    ],
  },
  {
    key: "prio",
    title: "Prioritized",
    dot: "bg-secondary",
    count: 4,
    tasks: [
      {
        id: "#ENH-1102",
        title: "API Gateway Latency Optimization for North America",
        project: "Global Connectivity",
        priority: "HIGH",
        tag: { label: "Performance", color: "ex" },
        stack: { icon: "storage", label: "Go" },
        date: "Sep 25",
        avatar: sprintAvatar,
      },
    ],
  },
  {
    key: "sprint",
    title: "In Current Sprint",
    dot: "bg-primary",
    count: 6,
    accent: "border-l-4 border-l-primary",
    tasks: [
      {
        id: "#BUG-2211",
        title: "Database Lock Contention in Billing Module",
        project: "Finance Core",
        priority: "CRITICAL",
        tag: { label: "Stability", color: "au" },
        stack: { icon: "database", label: "SQL" },
        date: "Sep 20",
        avatar: sprintAvatar,
      },
      {
        id: "#ENH-2240",
        title: "Add Workstream filter chips to Project Log",
        project: "Command UX",
        priority: "MEDIUM",
        tag: { label: "UI/UX", color: "dw" },
        stack: { icon: "palette", label: "Figma" },
        date: "Sep 22",
        avatar: sprintAvatar,
      },
    ],
  },
  {
    key: "progress",
    title: "In Progress",
    dot: "bg-status-medium",
    count: 3,
    accent: "border-l-4 border-l-status-medium",
    tasks: [
      {
        id: "#ENH-0933",
        title: "Redesign Portfolio Header for Executive View",
        project: "Command UX",
        priority: "MEDIUM",
        tag: { label: "UI/UX", color: "dw" },
        stack: { icon: "palette", label: "Figma" },
        date: "Today",
        avatar: sprintAvatar,
        progress: 65,
      },
    ],
  },
  {
    key: "blocked",
    title: "Blocked",
    dot: "bg-status-critical",
    count: 2,
    accent: "border-l-4 border-l-status-critical",
    tasks: [
      {
        id: "#BUG-2287",
        title: "Vendor OAuth handoff stalled — Fero Global",
        project: "Fero Auto-Plan",
        priority: "CRITICAL",
        tag: { label: "Integration", color: "ox" },
        stack: { icon: "vpn_key", label: "OAuth" },
        date: "4d overdue",
        avatar: sprintAvatar,
      },
    ],
  },
  {
    key: "uat",
    title: "UAT",
    dot: "bg-secondary",
    count: 3,
    tasks: [
      {
        id: "#ENH-4811",
        title: "Bulk WeighScale — UAT round 3 across 14 DCs",
        project: "Bulk WeighScale",
        priority: "MEDIUM",
        tag: { label: "Integration", color: "dw" },
        stack: { icon: "fact_check", label: "UAT" },
        date: "Sep 24",
        avatar: sprintAvatar,
        progress: 92,
      },
    ],
  },
  {
    key: "done",
    title: "Done",
    dot: "bg-status-low",
    count: 9,
    tasks: [
      {
        id: "#ENH-0808",
        title: "Roll out telemetry on inbound API logs",
        project: "Observability",
        priority: "LOW",
        tag: { label: "Backend", color: "ox" },
        stack: { icon: "monitoring", label: "Grafana" },
        date: "Sep 14",
        avatar: sprintAvatar,
      },
    ],
  },
];

function priorityBadge(p: Priority) {
  if (p === "CRITICAL") return "bg-status-critical/10 text-status-critical";
  if (p === "HIGH") return "bg-status-high/10 text-status-high";
  if (p === "MEDIUM") return "bg-status-medium/10 text-status-medium";
  return "bg-surface-container-high text-on-surface-variant";
}

function TaskCard({ task, accent }: { task: Task; accent?: string }) {
  return (
    <div className={`bg-surface-card border border-border-subtle rounded-lg p-3 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${accent ?? ""}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="font-mono text-xs text-on-surface-variant">{task.id}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityBadge(task.priority)}`}>{task.priority}</span>
      </div>
      <h4 className="text-sm font-medium mb-2 leading-tight">{task.title}</h4>
      <p className="text-[11px] text-on-surface-variant mb-3">Project: {task.project}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`bg-workstream-${task.tag.color}/10 text-workstream-${task.tag.color} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase`}>
          {task.tag.label}
        </span>
        <span className="flex items-center gap-1 text-on-surface-variant text-[10px]">
          <span className="material-symbols-outlined text-[14px]">{task.stack.icon}</span>
          {task.stack.label}
        </span>
      </div>
      {task.progress !== undefined && (
        <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden mb-2">
          <div className="bg-status-medium h-full" style={{ width: `${task.progress}%` }} />
        </div>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
        <div className="flex items-center gap-2">
          <img src={task.avatar} alt="" className="w-6 h-6 rounded-full" />
          <span className="text-[11px] text-on-surface-variant">{task.date}</span>
        </div>
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">chat_bubble_outline</span>
      </div>
    </div>
  );
}

function SprintBoard() {
  const isAdmin = useIsAdmin();
  return (
    <AppShell>
      {isAdmin && (
        <div className="px-6 py-2 bg-status-medium/10 border-b border-status-medium/20 flex items-center gap-2 text-[11px] text-on-surface">
          <span className="material-symbols-outlined !text-[16px] text-status-medium">edit_note</span>
          <span>
            Admin mode is ON. Sprint tasks are edited from the
            {" "}<Link to="/portfolio" className="text-primary font-bold underline">Portfolio · Tasks</Link>{" "}
            view (where each task has Sprint toggle, status and owner).
          </span>
        </div>
      )}
      <section className="px-6 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle bg-surface-card">
        <div className="flex items-center gap-6">
          <div>
            <p className="eyebrow">Active Sprint</p>
            <h2 className="section-title text-base mt-0.5">Sprint 24: Core Infrastructure Q3</h2>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Sept 12 – Sept 26 · 14 days remaining</p>
          </div>
          <div className="flex items-center -space-x-2">
            {[0, 1, 2].map((i) => (
              <img key={i} src={sprintAvatar} alt="" className="w-8 h-8 rounded-full border-2 border-surface-card object-cover" />
            ))}
            <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface-card flex items-center justify-center text-[10px] text-on-surface-variant font-bold">
              +12
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[
            { i: "filter_list", l: "Filter" },
            { i: "sort", l: "Sort" },
            { i: "ios_share", l: "Export" },
          ].map((b) => (
            <button
              key={b.l}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-surface-container-low text-xs font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">{b.i}</span>
              {b.l}
            </button>
          ))}
        </div>
      </section>
      <div className="overflow-x-auto p-6 flex gap-6 custom-scrollbar min-h-full">
        {columns.map((col) => (
          <div key={col.key} className="kanban-column flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <h3 className={`text-xs font-bold uppercase tracking-wider ${col.key === "blocked" ? "text-status-critical" : "text-on-surface"}`}>{col.title}</h3>
                <span className="text-on-surface-variant font-mono text-xs bg-surface-container-high px-1.5 py-0.5 rounded">
                  {col.count}
                </span>
              </div>
              <button className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 pr-1 pb-4">
              {col.tasks.map((t) => (
                <TaskCard key={t.id} task={t} accent={col.accent} />
              ))}
              <button className="w-full py-2 flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors border border-dashed border-border-subtle">
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span className="text-xs font-medium">Add Task</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  projects,
  statusStyle,
  type Person,
  type Project,
  type Status,
  type Task,
  type Workstream,
} from "@/data/projects";
import { relativeTime } from "@/lib/time";
import { useIsAdmin } from "@/lib/admin";
import { useDataVersion } from "@/lib/store";
import { ProjectEditDialog } from "@/components/admin-edit/ProjectEditDialog";
import { TaskEditDialog } from "@/components/admin-edit/TaskEditDialog";
import { createTask } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Projects & Tasks | Supply Chain Tech Hub" },
      { name: "description", content: "Cross-functional workstream oversight: status, blockers, stakeholders, and delivery milestones." },
      { property: "og:title", content: "Projects & Tasks | Supply Chain Tech Hub" },
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

const WORKSTREAMS = ["OX", "EX", "AU", "DW"] as const;
const STATUSES: (Status | "ALL")[] = ["ALL", "On Track", "In Progress", "Blocked", "Delayed", "Completed"];

type Scope = "projects" | "tasks";
type View = "list" | "grid";

interface TaskRow {
  project: Project;
  task: Task;
}

interface TaskEditTarget {
  project: Project;
  task: Task | null; // null = create
}

function Avatar({ person, size = 24 }: { person: Person; size?: number }) {
  return (
    <div
      title={person.name}
      className="inline-flex items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed font-bold text-[10px] border border-border-subtle"
      style={{ width: size, height: size }}
    >
      {person.initials}
    </div>
  );
}

function WorkstreamChip({ ws }: { ws: Workstream }) {
  const k = ws.toLowerCase();
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md bg-workstream-${k}/10 text-workstream-${k} font-mono text-xs`}>
      {ws}
    </span>
  );
}

function StatusPill({ s }: { s: Status }) {
  const st = statusStyle[s];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
      {s}
    </span>
  );
}

function SprintPill({ task }: { task: Task }) {
  if (!task.inSprint) {
    return <span className="text-[10px] uppercase tracking-wide text-on-surface-variant">Backlog</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase">
      <span className="material-symbols-outlined text-[12px]">flag</span>
      {task.sprint ?? "In Sprint"}
    </span>
  );
}

function PortfolioIndex() {
  const [view, setView] = useState<View>("list");
  const [scope, setScope] = useState<Scope>("projects");
  const [wsFilter, setWsFilter] = useState<Workstream | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [sprintFilter, setSprintFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const isAdmin = useIsAdmin();
  useDataVersion();
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [taskEdit, setTaskEdit] = useState<TaskEditTarget | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addTaskToProject = (project: Project) => {
    const t = createTask(project.id, { name: "New task", status: "On Track" });
    if (t) {
      setExpanded((prev) => new Set(prev).add(project.id));
      setTaskEdit({ project, task: t });
      toast.success("Task created — fill in details");
    }
  };

  const sprints = useMemo(() => {
    const s = new Set<string>();
    projects.forEach((p) => p.tasks.forEach((t) => t.sprint && s.add(t.sprint)));
    return ["ALL", ...Array.from(s).sort()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (wsFilter !== "ALL" && p.workstream !== wsFilter) return false;
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (sprintFilter !== "ALL" && !p.tasks.some((t) => t.sprint === sprintFilter)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.techOwner.name.toLowerCase().includes(q) ||
        p.businessOwner.name.toLowerCase().includes(q) ||
        p.tasks.some((t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
      );
    });
  }, [wsFilter, statusFilter, sprintFilter, query]);

  const filteredTasks: TaskRow[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows: TaskRow[] = [];
    projects.forEach((p) => {
      if (wsFilter !== "ALL" && p.workstream !== wsFilter) return;
      p.tasks.forEach((task) => {
        if (statusFilter !== "ALL" && task.status !== statusFilter) return;
        if (sprintFilter !== "ALL" && task.sprint !== sprintFilter) return;
        if (q) {
          const hay = `${p.name} ${task.name} ${task.id} ${task.techOwner.name} ${task.businessOwner.name} ${task.currentlyWith.name}`.toLowerCase();
          if (!hay.includes(q)) return;
        }
        rows.push({ project: p, task });
      });
    });
    return rows;
  }, [wsFilter, statusFilter, sprintFilter, query]);

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Workstream Oversight</p>
            <h2 className="page-title text-primary mt-1">Projects &amp; Tasks</h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Supply chain enhancements across workstreams — owners, sprint status, and live updates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setCreating(true)}
                className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:opacity-90 shadow-sm"
              >
                <span className="material-symbols-outlined !text-[16px]">add</span>
                New project
              </button>
            )}
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
              {(
                [
                  { k: "projects", label: "Projects" },
                  { k: "tasks", label: "All Tasks" },
                ] as { k: Scope; label: string }[]
              ).map(({ k, label }) => (
                <button
                  key={k}
                  onClick={() => setScope(k)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    scope === k
                      ? "bg-surface-card shadow-sm text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
              {(["list", "grid"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-label={`${v} view`}
                  className={`p-1.5 rounded transition-colors ${
                    view === v ? "bg-surface-card shadow-sm text-primary" : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{v === "list" ? "view_list" : "grid_view"}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <span className="material-symbols-outlined !absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search project, task, ID or owner…"
              className="w-full bg-surface-container-low border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            {(["ALL", ...WORKSTREAMS] as const).map((w) => {
              const active = wsFilter === w;
              const k = w === "ALL" ? "primary" : `workstream-${w.toLowerCase()}`;
              return (
                <button
                  key={w}
                  onClick={() => setWsFilter(w)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    active ? `bg-${k} text-white shadow-sm` : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {w === "ALL" ? "All" : w}
                </button>
              );
            })}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "ALL")}
            className="bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-xs"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s === "ALL" ? "All statuses" : s}</option>
            ))}
          </select>
          <select
            value={sprintFilter}
            onChange={(e) => setSprintFilter(e.target.value)}
            className="bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-xs"
          >
            {sprints.map((s) => (
              <option key={s} value={s}>{s === "ALL" ? "All sprints" : s}</option>
            ))}
          </select>
        </div>

        {view === "list" ? (
          scope === "projects" ? (
            <ProjectsTable
              rows={filteredProjects}
              isAdmin={isAdmin}
              onEdit={setEditing}
              expanded={expanded}
              onToggle={toggleExpand}
              onEditTask={(project, task) => setTaskEdit({ project, task })}
              onAddTask={addTaskToProject}
            />
          ) : (
            <TasksTable
              rows={filteredTasks}
              isAdmin={isAdmin}
              onEditTask={(project, task) => setTaskEdit({ project, task })}
            />
          )
        ) : scope === "projects" ? (
          <ProjectsGrid
            rows={filteredProjects}
            isAdmin={isAdmin}
            onEdit={setEditing}
            expanded={expanded}
            onToggle={toggleExpand}
            onEditTask={(project, task) => setTaskEdit({ project, task })}
            onAddTask={addTaskToProject}
          />
        ) : (
          <TasksGrid
            rows={filteredTasks}
            isAdmin={isAdmin}
            onEditTask={(project, task) => setTaskEdit({ project, task })}
          />
        )}
      </div>
      <ProjectEditDialog
        open={!!editing || creating}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        project={editing}
      />
      <TaskEditDialog
        open={!!taskEdit}
        onClose={() => setTaskEdit(null)}
        projectId={taskEdit?.project.id}
        task={taskEdit?.task ?? null}
      />
    </AppShell>
  );
}

interface ProjectListProps {
  rows: Project[];
  isAdmin: boolean;
  onEdit: (p: Project) => void;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onEditTask: (project: Project, task: Task) => void;
  onAddTask: (project: Project) => void;
}

interface TaskListProps {
  rows: TaskRow[];
  isAdmin: boolean;
  onEditTask: (project: Project, task: Task) => void;
}

function ProjectsTable({ rows, isAdmin, onEdit, expanded, onToggle, onEditTask, onAddTask }: ProjectListProps) {
  return (
    <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm min-w-[1440px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-border-subtle text-on-surface-variant text-xs">
              <th className="px-2 py-3 w-8" />
              {[
                "Project", "Lead Task", "Task ID", "Type", "Sprint", "Status",
                "Currently With", "Tech Owner", "Business Owner", "Log", "Latest Update", "Workstream",
              ].map((h) => (
                <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
              {isAdmin && <th className="px-3 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {rows.map((p) => {
              const lead = p.tasks[0];
              const isOpen = expanded.has(p.id);
              return (
                <>
                <tr key={p.id} className="hover:bg-surface-container-lowest transition-colors group card-hover-effect">
                  <td className="px-2 py-4 align-top">
                    <button
                      onClick={() => onToggle(p.id)}
                      title={isOpen ? "Hide tasks" : "Show tasks"}
                      className="text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded p-1"
                    >
                      <span className={`material-symbols-outlined !text-[18px] transition-transform ${isOpen ? "rotate-90" : ""}`}>
                        chevron_right
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <Link to="/portfolio/$projectId" params={{ projectId: p.id }} className="font-bold text-on-surface group-hover:text-primary">
                      {p.name}
                    </Link>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      {p.tasks.length} task{p.tasks.length === 1 ? "" : "s"}
                    </p>
                  </td>
                  <td className="px-4 py-4">{lead?.name ?? "—"}</td>
                  <td className="px-4 py-4 font-mono text-xs text-on-surface-variant">{lead?.id ?? p.eid}</td>
                  <td className="px-4 py-4 text-xs">{lead?.type ?? p.type}</td>
                  <td className="px-4 py-4">{lead ? <SprintPill task={lead} /> : "—"}</td>
                  <td className="px-4 py-4"><StatusPill s={p.status} /></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-2"><Avatar person={p.currentlyWith} /><span className="text-xs">{p.currentlyWith.name}</span></div></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-2"><Avatar person={p.techOwner} /><span className="text-xs">{p.techOwner.name}</span></div></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-2"><Avatar person={p.businessOwner} /><span className="text-xs">{p.businessOwner.name}</span></div></td>
                  <td className="px-4 py-4">
                    <Link to="/portfolio/$projectId" params={{ projectId: p.id }} className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline">
                      <span className="material-symbols-outlined text-[16px]">history_edu</span>
                      {p.enhancementLog.length}
                    </Link>
                  </td>
                  <td className="px-4 py-4 max-w-[260px]">
                    <p className="text-xs text-on-surface truncate" title={p.latestUpdate.text}>{p.latestUpdate.text}</p>
                    <p className="text-[10px] font-mono text-on-surface-variant mt-0.5">{relativeTime(p.latestUpdate.at)}</p>
                  </td>
                  <td className="px-4 py-4"><WorkstreamChip ws={p.workstream} /></td>
                  {isAdmin && (
                    <td className="px-3 py-4">
                      <button
                        onClick={() => onEdit(p)}
                        title="Edit project"
                        className="text-primary hover:bg-primary/10 rounded p-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </td>
                  )}
                </tr>
                {isOpen && (
                  <tr key={`${p.id}-drill`} className="bg-surface-container-lowest">
                    <td />
                    <td colSpan={isAdmin ? 13 : 12} className="px-4 py-3">
                      <TaskDrilldown
                        project={p}
                        isAdmin={isAdmin}
                        onEditTask={onEditTask}
                        onAddTask={onAddTask}
                      />
                    </td>
                  </tr>
                )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-surface-container-low border-t border-border-subtle text-xs text-on-surface-variant">
        Showing {rows.length} of {projects.length} projects
      </div>
    </div>
  );
}

function TasksTable({ rows, isAdmin, onEditTask }: TaskListProps) {
  return (
    <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm min-w-[1400px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-border-subtle text-on-surface-variant text-xs">
              {[
                "Project", "Task", "Task ID", "Type", "Sprint", "Status",
                "Currently With", "Tech Owner", "Business Owner", "Latest Update", "Workstream",
              ].map((h) => (
                <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
              {isAdmin && <th className="px-3 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {rows.map(({ project, task }) => (
              <tr key={task.id} className="hover:bg-surface-container-lowest transition-colors group">
                <td className="px-4 py-4">
                  <Link to="/portfolio/$projectId" params={{ projectId: project.id }} className="text-xs text-on-surface-variant hover:text-primary">
                    {project.name}
                  </Link>
                </td>
                <td className="px-4 py-4 font-medium text-on-surface">{task.name}</td>
                <td className="px-4 py-4 font-mono text-xs text-on-surface-variant">{task.id}</td>
                <td className="px-4 py-4 text-xs">{task.type}</td>
                <td className="px-4 py-4"><SprintPill task={task} /></td>
                <td className="px-4 py-4"><StatusPill s={task.status} /></td>
                <td className="px-4 py-4"><div className="flex items-center gap-2"><Avatar person={task.currentlyWith} /><span className="text-xs">{task.currentlyWith.name}</span></div></td>
                <td className="px-4 py-4"><div className="flex items-center gap-2"><Avatar person={task.techOwner} /><span className="text-xs">{task.techOwner.name}</span></div></td>
                <td className="px-4 py-4"><div className="flex items-center gap-2"><Avatar person={task.businessOwner} /><span className="text-xs">{task.businessOwner.name}</span></div></td>
                <td className="px-4 py-4 max-w-[260px]">
                  <p className="text-xs text-on-surface truncate" title={task.latestUpdate.text}>{task.latestUpdate.text}</p>
                  <p className="text-[10px] font-mono text-on-surface-variant mt-0.5">{relativeTime(task.latestUpdate.at)}</p>
                </td>
                <td className="px-4 py-4"><WorkstreamChip ws={project.workstream} /></td>
                {isAdmin && (
                  <td className="px-3 py-4">
                    <button
                      onClick={() => onEditTask(project, task)}
                      title="Edit task"
                      className="text-primary hover:bg-primary/10 rounded p-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-surface-container-low border-t border-border-subtle text-xs text-on-surface-variant">
        Showing {rows.length} tasks
      </div>
    </div>
  );
}

function ProjectsGrid({ rows, isAdmin, onEdit, expanded, onToggle, onEditTask, onAddTask }: ProjectListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
      {rows.map((p) => {
        const lead = p.tasks[0];
        const isOpen = expanded.has(p.id);
        return (
          <div
            key={p.id}
            className={`group relative bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border-l-4 border-l-workstream-${p.workstream.toLowerCase()} card-hover-effect min-h-[240px] flex flex-col`}
          >
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(p);
                }}
                title="Edit project"
                className="absolute top-3 right-3 z-10 text-primary bg-surface-card border border-border-subtle rounded-md p-1 shadow-sm hover:bg-primary/10"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            )}
            <Link
              to="/portfolio/$projectId"
              params={{ projectId: p.id }}
              className="flex-1 flex flex-col"
            >
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-mono text-on-surface-variant">{lead?.id ?? p.eid}</p>
                  <h3 className="font-bold text-on-surface group-hover:text-primary">{p.name}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{lead?.name}</p>
                </div>
                <WorkstreamChip ws={p.workstream} />
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill s={p.status} />
                {lead && <SprintPill task={lead} />}
                <span className="text-[10px] uppercase tracking-wide bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded">{lead?.type ?? p.type}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle">
                <OwnerCell label="Now with" person={p.currentlyWith} />
                <OwnerCell label="Tech" person={p.techOwner} />
                <OwnerCell label="Business" person={p.businessOwner} />
              </div>
              <div className="bg-surface-container-low rounded-lg p-3">
                <div className="flex items-center gap-1 text-on-surface-variant text-[10px] mb-1">
                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                  {relativeTime(p.latestUpdate.at)}
                </div>
                <p className="text-xs text-on-surface line-clamp-2">{p.latestUpdate.text}</p>
              </div>
            </div>
            </Link>
            <div className="px-5 py-2.5 bg-surface-container-lowest border-t border-border-subtle flex items-center justify-between text-xs">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggle(p.id);
                }}
                className="text-on-surface-variant inline-flex items-center gap-1 hover:text-primary"
              >
                <span className={`material-symbols-outlined text-[14px] transition-transform ${isOpen ? "rotate-90" : ""}`}>
                  chevron_right
                </span>
                {p.tasks.length} task{p.tasks.length === 1 ? "" : "s"}
              </button>
              <Link
                to="/portfolio/$projectId"
                params={{ projectId: p.id }}
                className="text-primary font-medium inline-flex items-center gap-1"
              >
                Open
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 bg-surface-container-lowest border-t border-border-subtle">
                <TaskDrilldown
                  project={p}
                  isAdmin={isAdmin}
                  onEditTask={onEditTask}
                  onAddTask={onAddTask}
                  compact
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TasksGrid({ rows, isAdmin, onEditTask }: TaskListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {rows.map(({ project, task }) => (
        <div
          key={task.id}
          className={`group relative bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border-l-4 border-l-workstream-${project.workstream.toLowerCase()} card-hover-effect`}
        >
          {isAdmin && (
            <button
              onClick={() => onEditTask(project, task)}
              title="Edit task"
              className="absolute top-3 right-3 z-10 text-primary bg-surface-card border border-border-subtle rounded-md p-1 shadow-sm hover:bg-primary/10"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
          )}
          <Link
            to="/portfolio/$projectId"
            params={{ projectId: project.id }}
            className="block"
          >
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-mono text-on-surface-variant">{task.id} · {project.name}</p>
                <h3 className="font-bold text-on-surface group-hover:text-primary">{task.name}</h3>
              </div>
              <WorkstreamChip ws={project.workstream} />
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill s={task.status} />
              <SprintPill task={task} />
              <span className="text-[10px] uppercase tracking-wide bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded">{task.type}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle">
              <OwnerCell label="Now with" person={task.currentlyWith} />
              <OwnerCell label="Tech" person={task.techOwner} />
              <OwnerCell label="Business" person={task.businessOwner} />
            </div>
            <div className="bg-surface-container-low rounded-lg p-3">
              <div className="flex items-center gap-1 text-on-surface-variant text-[10px] mb-1">
                <span className="material-symbols-outlined text-[12px]">schedule</span>
                {relativeTime(task.latestUpdate.at)}
              </div>
              <p className="text-xs text-on-surface line-clamp-2">{task.latestUpdate.text}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function OwnerCell({ label, person }: { label: string; person: Person }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] uppercase tracking-wide text-on-surface-variant">{label}</span>
      <div className="flex items-center gap-1.5">
        <Avatar person={person} size={20} />
        <span className="text-[11px] text-on-surface truncate">{person.name}</span>
      </div>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useIsAdmin } from "@/lib/admin";
import { useDataVersion, deriveTaskColumn, moveTaskColumn } from "@/lib/store";
import { projects, type BoardColumn, type Project, type Task } from "@/data/projects";
import { TaskEditDialog } from "@/components/admin-edit/TaskEditDialog";
import { toast } from "sonner";
import { deleteTask } from "@/lib/store";

export const Route = createFileRoute("/sprint-board")({
  head: () => ({
    meta: [
      { title: "Sprint Board | Supply Chain Tech Hub" },
      {
        name: "description",
        content:
          "Live Kanban of the active sprint — backlog, prioritized, in-sprint, in-progress, blocked, UAT and done — across SCM workstreams.",
      },
      { property: "og:title", content: "Sprint Board | Supply Chain Tech Hub" },
      {
        property: "og:description",
        content: "Kanban view of the active sprint across the engineering workstreams.",
      },
    ],
  }),
  component: SprintBoard,
});

type ColumnDef = {
  key: BoardColumn;
  title: string;
  dot: string;
  accent?: string;
  critical?: boolean;
};

const COLUMNS: ColumnDef[] = [
  { key: "backlog", title: "Backlog", dot: "bg-outline" },
  { key: "prio", title: "Prioritized", dot: "bg-secondary" },
  { key: "sprint", title: "In Current Sprint", dot: "bg-primary", accent: "border-l-4 border-l-primary" },
  { key: "progress", title: "In Progress", dot: "bg-status-medium", accent: "border-l-4 border-l-status-medium" },
  { key: "blocked", title: "Blocked", dot: "bg-status-critical", accent: "border-l-4 border-l-status-critical", critical: true },
  { key: "uat", title: "UAT", dot: "bg-secondary" },
  { key: "done", title: "Done", dot: "bg-status-low" },
];

function priorityBadge(p?: string) {
  if (p === "Critical") return "bg-status-critical/10 text-status-critical";
  if (p === "High") return "bg-status-high/10 text-status-high";
  if (p === "Medium") return "bg-status-medium/10 text-status-medium";
  return "bg-surface-container-high text-on-surface-variant";
}

function priorityLabel(p?: string) {
  return (p ?? "Medium").toUpperCase();
}

function workstreamKey(p: Project) {
  return p.workstream.toLowerCase();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Row = { project: Project; task: Task; column: BoardColumn };

function TaskCard({
  row,
  accent,
  isAdmin,
  onEdit,
  onMove,
  onDelete,
}: {
  row: Row;
  accent?: string;
  isAdmin: boolean;
  onEdit: (r: Row) => void;
  onMove: (r: Row, c: BoardColumn) => void;
  onDelete: (r: Row) => void;
}) {
  const { task, project } = row;
  const [moveOpen, setMoveOpen] = useState(false);
  return (
    <div
      className={`group bg-surface-card border border-border-subtle rounded-lg p-3 hover:shadow-md transition-all relative ${
        accent ?? ""
      }`}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <span className="font-mono text-xs text-on-surface-variant">{task.id}</span>
        <div className="flex items-center gap-1">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityBadge(task.priority)}`}>
            {priorityLabel(task.priority)}
          </span>
          {isAdmin && (
            <button
              onClick={() => onEdit(row)}
              title="Edit task"
              className="text-primary hover:bg-primary/10 rounded p-0.5"
            >
              <span className="material-symbols-outlined !text-[16px]">edit</span>
            </button>
          )}
        </div>
      </div>
      <h4 className="text-sm font-medium mb-1.5 leading-tight">{task.name}</h4>
      <p className="text-[11px] text-on-surface-variant mb-2 truncate" title={project.name}>
        {project.name}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        <span
          className={`bg-workstream-${workstreamKey(project)}/10 text-workstream-${workstreamKey(
            project,
          )} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase`}
        >
          {project.workstream}
        </span>
        {task.sprint && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">
            <span className="material-symbols-outlined !text-[12px]">flag</span>
            {task.sprint}
          </span>
        )}
        <span className="text-[10px] uppercase tracking-wide text-on-surface-variant">{task.type}</span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
        <div className="flex items-center gap-2 min-w-0">
          <div
            title={task.currentlyWith.name}
            className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-[9px] font-bold"
          >
            {task.currentlyWith.initials}
          </div>
          <span className="text-[11px] text-on-surface-variant truncate">
            {formatDate(task.latestUpdate.at)}
          </span>
        </div>
        {isAdmin ? (
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setMoveOpen((v) => !v)}
                title="Move to column"
                className="text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded p-0.5"
              >
                <span className="material-symbols-outlined !text-[16px]">swap_horiz</span>
              </button>
              {moveOpen && (
                <>
                  <button
                    aria-label="Close menu"
                    onClick={() => setMoveOpen(false)}
                    className="fixed inset-0 z-30 cursor-default"
                  />
                  <div className="absolute right-0 z-40 mt-1 w-44 bg-surface-card border border-border-subtle rounded-lg shadow-lg py-1">
                    {COLUMNS.filter((c) => c.key !== row.column).map((c) => (
                      <button
                        key={c.key}
                        onClick={() => {
                          onMove(row, c.key);
                          setMoveOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-surface-container-low flex items-center gap-2"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                        {c.title}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => onDelete(row)}
              title="Delete task"
              className="text-on-surface-variant hover:text-status-critical hover:bg-status-critical/10 rounded p-0.5"
            >
              <span className="material-symbols-outlined !text-[16px]">delete</span>
            </button>
          </div>
        ) : (
          <span className="material-symbols-outlined !text-[16px] text-on-surface-variant">chat_bubble_outline</span>
        )}
      </div>
    </div>
  );
}

function SprintBoard() {
  const isAdmin = useIsAdmin();
  useDataVersion();
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState<{ column?: BoardColumn } | null>(null);

  const allRows: Row[] = useMemo(() => {
    const rows: Row[] = [];
    projects.forEach((p) => {
      p.tasks.forEach((t) => rows.push({ project: p, task: t, column: deriveTaskColumn(t) }));
    });
    return rows;
  }, []);

  const byColumn = useMemo(() => {
    const m = new Map<BoardColumn, Row[]>();
    COLUMNS.forEach((c) => m.set(c.key, []));
    allRows.forEach((r) => m.get(r.column)!.push(r));
    return m;
  }, [allRows]);

  const sprintRows = allRows.filter((r) =>
    r.column === "sprint" || r.column === "progress" || r.column === "blocked" || r.column === "uat",
  );
  const sprintNames = Array.from(
    new Set(sprintRows.map((r) => r.task.sprint).filter((s): s is string => !!s)),
  );
  const activeSprintLabel = sprintNames.length ? sprintNames.join(" · ") : "Active Sprint";
  const sprintOwners = Array.from(
    new Map(sprintRows.map((r) => [r.task.currentlyWith.name, r.task.currentlyWith])).values(),
  );

  const handleMove = (r: Row, target: BoardColumn) => {
    moveTaskColumn(r.project.id, r.task.id, target);
    toast.success(`Moved to ${COLUMNS.find((c) => c.key === target)?.title}`);
  };
  const handleDelete = (r: Row) => {
    if (!confirm(`Delete task "${r.task.name}"?`)) return;
    deleteTask(r.project.id, r.task.id);
    toast.success("Task deleted");
  };

  return (
    <AppShell>
      {isAdmin && (
        <div className="px-6 py-2 bg-status-medium/10 border-b border-status-medium/20 flex items-center gap-2 text-[11px] text-on-surface">
          <span className="material-symbols-outlined !text-[16px] text-status-medium">edit_note</span>
          <span>
            Admin mode is ON — click <span className="font-bold">edit</span> to edit a task,{" "}
            <span className="font-bold">swap</span> to move it between columns, or{" "}
            <span className="font-bold">Add task</span> on any column.
          </span>
        </div>
      )}
      <section className="px-6 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle bg-surface-card">
        <div className="flex items-center gap-6">
          <div>
            <p className="eyebrow">Active Sprint</p>
            <h2 className="section-title text-base mt-0.5">{activeSprintLabel}</h2>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {sprintRows.length} sprint tasks · {byColumn.get("blocked")!.length} blocked ·{" "}
              {byColumn.get("uat")!.length} in UAT
            </p>
          </div>
          <div className="flex items-center -space-x-2">
            {sprintOwners.slice(0, 4).map((o) => (
              <div
                key={o.name}
                title={o.name}
                className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed border-2 border-surface-card flex items-center justify-center text-[10px] font-bold"
              >
                {o.initials}
              </div>
            ))}
            {sprintOwners.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface-card flex items-center justify-center text-[10px] text-on-surface-variant font-bold">
                +{sprintOwners.length - 4}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setCreating({})}
              className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:opacity-90 shadow-sm"
            >
              <span className="material-symbols-outlined !text-[16px]">add</span>
              New task
            </button>
          )}
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
        {COLUMNS.map((col) => {
          const rows = byColumn.get(col.key) ?? [];
          return (
            <div key={col.key} className="kanban-column flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider ${
                      col.critical ? "text-status-critical" : "text-on-surface"
                    }`}
                  >
                    {col.title}
                  </h3>
                  <span className="text-on-surface-variant font-mono text-xs bg-surface-container-high px-1.5 py-0.5 rounded">
                    {rows.length}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3 pr-1 pb-4">
                {rows.map((r) => (
                  <TaskCard
                    key={`${r.project.id}-${r.task.id}`}
                    row={r}
                    accent={col.accent}
                    isAdmin={isAdmin}
                    onEdit={setEditing}
                    onMove={handleMove}
                    onDelete={handleDelete}
                  />
                ))}
                {rows.length === 0 && (
                  <div className="text-[11px] text-on-surface-variant italic px-1 py-2">
                    No tasks
                  </div>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setCreating({ column: col.key })}
                    className="w-full py-2 flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors border border-dashed border-border-subtle"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span className="text-xs font-medium">Add Task</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskEditDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        projectId={editing?.project.id}
        task={editing?.task ?? null}
      />
      <TaskEditDialog
        open={!!creating}
        onClose={() => setCreating(null)}
        task={null}
        defaultBoardColumn={creating?.column}
      />
    </AppShell>
  );
}
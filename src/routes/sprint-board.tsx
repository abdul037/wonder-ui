import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useIsAdmin } from "@/lib/admin";
import {
  useDataVersion,
  deriveTaskColumn,
  moveTaskColumn,
  createTask,
} from "@/lib/store";
import { projects, type BoardColumn, type Project, type Task } from "@/data/projects";
import { TaskEditDialog } from "@/components/admin-edit/TaskEditDialog";
import { TaskQuickEdit } from "@/components/admin-edit/TaskQuickEdit";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

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

function TaskCardBody({ row, accent }: { row: Row; accent?: string }) {
  const { task, project } = row;
  return (
    <div
      className={`group bg-surface-card border border-border-subtle rounded-xl p-3 hover:shadow-md transition-all ${
        accent ?? ""
      }`}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <span className="font-mono text-[11px] text-on-surface-variant">{task.id}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityBadge(task.priority)}`}>
          {priorityLabel(task.priority)}
        </span>
      </div>
      <h4 className="text-[13px] font-semibold mb-1.5 leading-snug">{task.name}</h4>
      <p className="text-[11px] text-on-surface-variant mb-2.5 truncate" title={project.name}>
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
        <span className="material-symbols-outlined !text-[14px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">
          drag_indicator
        </span>
      </div>
    </div>
  );
}

function DraggableCard({
  row,
  accent,
  onClick,
  isAdmin,
}: {
  row: Row;
  accent?: string;
  onClick: () => void;
  isAdmin: boolean;
}) {
  const id = `${row.project.id}::${row.task.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled: !isAdmin,
    data: { row },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: isAdmin ? "grab" : "pointer",
        touchAction: "manipulation",
      }}
    >
      <div onClick={onClick} {...(isAdmin ? listeners : {})}>
        <TaskCardBody row={row} accent={accent} />
      </div>
    </div>
  );
}

function DroppableColumn({
  col,
  rows,
  isAdmin,
  onCardClick,
  onAdd,
  isOver,
  draggingFrom,
}: {
  col: ColumnDef;
  rows: Row[];
  isAdmin: boolean;
  onCardClick: (r: Row) => void;
  onAdd: () => void;
  isOver: boolean;
  draggingFrom: BoardColumn | null;
}) {
  const { setNodeRef } = useDroppable({ id: `col::${col.key}` });
  const showHighlight = isOver && draggingFrom !== col.key;
  return (
    <div className="kanban-column flex flex-col gap-3 shrink-0">
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
          <span className="text-on-surface-variant font-mono text-[11px] bg-surface-container-high px-1.5 py-0.5 rounded">
            {rows.length}
          </span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 pr-1 pb-4 min-h-[60px] rounded-xl transition-all ${
          showHighlight ? "bg-primary/5 ring-2 ring-primary/40 ring-inset" : ""
        }`}
      >
        {rows.map((r) => (
          <DraggableCard
            key={`${r.project.id}-${r.task.id}`}
            row={r}
            accent={col.accent}
            isAdmin={isAdmin}
            onClick={() => onCardClick(r)}
          />
        ))}
        {rows.length === 0 && !showHighlight && (
          <div className="text-[11px] text-on-surface-variant italic px-1 py-2">No tasks</div>
        )}
        {isAdmin && (
          <button
            onClick={onAdd}
            className="w-full py-2 flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors border border-dashed border-border-subtle"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="text-[11px] font-semibold">Add task</span>
          </button>
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
  const [dragging, setDragging] = useState<Row | null>(null);
  const [overCol, setOverCol] = useState<BoardColumn | null>(null);
  const [inlineAdd, setInlineAdd] = useState<{ column: BoardColumn; value: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

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

  const onDragStart = (e: DragStartEvent) => {
    const row = (e.active.data.current as { row?: Row } | undefined)?.row ?? null;
    setDragging(row);
  };
  const onDragOver = (e: { over: { id: string | number } | null }) => {
    const id = e.over?.id;
    if (typeof id === "string" && id.startsWith("col::")) {
      setOverCol(id.slice(5) as BoardColumn);
    } else {
      setOverCol(null);
    }
  };
  const onDragEnd = (e: DragEndEvent) => {
    const row = (e.active.data.current as { row?: Row } | undefined)?.row;
    const overId = e.over?.id;
    setDragging(null);
    setOverCol(null);
    if (!row || typeof overId !== "string" || !overId.startsWith("col::")) return;
    const target = overId.slice(5) as BoardColumn;
    if (target === row.column) return;
    moveTaskColumn(row.project.id, row.task.id, target);
    toast.success(`Moved to ${COLUMNS.find((c) => c.key === target)?.title}`, { duration: 1400 });
  };

  const handleInlineAdd = () => {
    if (!inlineAdd) return;
    const name = inlineAdd.value.trim();
    if (!name) {
      setInlineAdd(null);
      return;
    }
    const targetProject = projects[0];
    if (!targetProject) return;
    const created = createTask(targetProject.id, {
      name,
      boardColumn: inlineAdd.column,
      inSprint:
        inlineAdd.column === "sprint" ||
        inlineAdd.column === "progress" ||
        inlineAdd.column === "blocked" ||
        inlineAdd.column === "uat",
    });
    if (created) {
      moveTaskColumn(targetProject.id, created.id, inlineAdd.column);
      toast.success("Task added");
    }
    setInlineAdd(null);
  };

  return (
    <AppShell>
      {isAdmin && (
        <div className="px-6 py-2 bg-status-medium/10 border-b border-status-medium/20 flex items-center gap-2 text-[11px] text-on-surface">
          <span className="material-symbols-outlined !text-[16px] text-status-medium">edit_note</span>
          <span>
            Admin mode is ON — <span className="font-bold">drag</span> cards between columns,{" "}
            <span className="font-bold">click</span> any card to quick-edit, or{" "}
            <span className="font-bold">Add task</span> at the bottom of a column.
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setDragging(null);
          setOverCol(null);
        }}
      >
        <div className="overflow-x-auto p-6 flex gap-6 custom-scrollbar min-h-full">
          {COLUMNS.map((col) => (
            <DroppableColumn
              key={col.key}
              col={col}
              rows={byColumn.get(col.key) ?? []}
              isAdmin={isAdmin}
              onCardClick={(r) => setEditing(r)}
              onAdd={() => setInlineAdd({ column: col.key, value: "" })}
              isOver={overCol === col.key}
              draggingFrom={dragging?.column ?? null}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 180 }}>
          {dragging ? (
            <div className="rotate-1 shadow-2xl">
              <TaskCardBody row={dragging} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {inlineAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setInlineAdd(null)}>
          <div className="bg-surface-card border border-border-subtle rounded-xl shadow-2xl w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold mb-2">
              Add task to {COLUMNS.find((c) => c.key === inlineAdd.column)?.title}
            </div>
            <input
              autoFocus
              value={inlineAdd.value}
              onChange={(e) => setInlineAdd({ ...inlineAdd, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInlineAdd();
                if (e.key === "Escape") setInlineAdd(null);
              }}
              placeholder="Task title — press Enter to create"
              className="w-full px-3 py-2 text-sm rounded-md bg-surface-container-low border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setInlineAdd(null)}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-on-surface-variant hover:bg-surface-container-low"
              >
                Cancel
              </button>
              <button
                onClick={handleInlineAdd}
                className="px-3 py-1.5 rounded-md text-xs font-bold bg-primary text-white hover:opacity-90"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <TaskQuickEdit
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
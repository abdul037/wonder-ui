import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  applyTaskDraft,
  deleteTask,
  moveTaskColumn,
  taskToDraft,
  type TaskDraft,
} from "@/lib/store";
import {
  projects,
  type BoardColumn,
  type Priority,
  type Status,
  type Task,
} from "@/data/projects";
import { useIsAdmin } from "@/lib/admin";

const STATUSES: Status[] = ["On Track", "In Progress", "Blocked", "Delayed", "Completed"];
const PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Low"];
const COLUMNS: { key: BoardColumn; label: string; tone: string }[] = [
  { key: "backlog", label: "Backlog", tone: "bg-outline/10 text-on-surface-variant" },
  { key: "prio", label: "Prioritized", tone: "bg-secondary/10 text-secondary" },
  { key: "sprint", label: "In Sprint", tone: "bg-primary/10 text-primary" },
  { key: "progress", label: "In Progress", tone: "bg-status-medium/10 text-status-medium" },
  { key: "blocked", label: "Blocked", tone: "bg-status-critical/10 text-status-critical" },
  { key: "uat", label: "UAT", tone: "bg-secondary/10 text-secondary" },
  { key: "done", label: "Done", tone: "bg-status-low/10 text-status-low" },
];

function PillRow<T extends string>({
  value,
  options,
  onChange,
  toneFor,
  disabled,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  toneFor?: (v: T, active: boolean) => string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value === opt;
        const tone =
          toneFor?.(opt, active) ??
          (active
            ? "bg-primary text-on-primary border-primary"
            : "bg-surface-container-low text-on-surface-variant border-border-subtle hover:bg-surface-container");
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${tone} ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function priorityTone(p: Priority, active: boolean) {
  const map: Record<Priority, string> = {
    Critical: "bg-status-critical text-white border-status-critical",
    High: "bg-status-high text-white border-status-high",
    Medium: "bg-status-medium text-white border-status-medium",
    Low: "bg-status-low text-white border-status-low",
  };
  if (active) return map[p];
  return "bg-surface-container-low text-on-surface-variant border-border-subtle hover:bg-surface-container";
}

export function TaskQuickEdit({
  open,
  onClose,
  projectId,
  task,
}: {
  open: boolean;
  onClose: () => void;
  projectId?: string;
  task: Task | null;
}) {
  const isAdmin = useIsAdmin();
  const [draft, setDraft] = useState<TaskDraft | null>(null);

  useEffect(() => {
    if (open && task) setDraft(taskToDraft(task));
    if (!open) setDraft(null);
  }, [open, task]);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projectId],
  );

  if (!task || !draft || !projectId) {
    return (
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent className="sm:max-w-md" />
      </Sheet>
    );
  }

  const autosave = (next: TaskDraft, hint?: string) => {
    setDraft(next);
    if (!isAdmin) return;
    applyTaskDraft(projectId, task.id, next);
    if (next.boardColumn && next.boardColumn !== task.boardColumn) {
      moveTaskColumn(projectId, task.id, next.boardColumn);
    }
    if (hint) toast.success(hint, { duration: 1200 });
  };

  const set = <K extends keyof TaskDraft>(k: K, v: TaskDraft[K], hint?: string) =>
    autosave({ ...draft, [k]: v }, hint);

  const onDelete = () => {
    if (!confirm(`Delete task "${task.name}"?`)) return;
    deleteTask(projectId, task.id);
    toast.success("Task deleted");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-md w-full overflow-y-auto custom-scrollbar p-0 bg-surface-card">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border-subtle space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-on-surface-variant">{task.id}</span>
            {isAdmin ? (
              <span className="text-[10px] uppercase tracking-widest text-status-low font-bold">
                Auto-saving
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                Read only
              </span>
            )}
          </div>
          <SheetTitle className="text-base font-semibold leading-tight">
            {isAdmin ? (
              <input
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                onBlur={() => toast.success("Saved", { duration: 800 })}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 px-0 text-base font-semibold text-on-surface"
              />
            ) : (
              draft.name
            )}
          </SheetTitle>
          <SheetDescription className="text-xs text-on-surface-variant">
            {project?.name ?? "—"}
          </SheetDescription>
        </SheetHeader>

        <div className="px-5 py-4 space-y-5">
          <Field label="Column">
            <PillRow
              value={(draft.boardColumn ?? "backlog") as BoardColumn}
              options={COLUMNS.map((c) => c.key) as readonly BoardColumn[]}
              disabled={!isAdmin}
              onChange={(v) => set("boardColumn", v, `Moved to ${COLUMNS.find((c) => c.key === v)?.label}`)}
              toneFor={(v, active) => {
                const c = COLUMNS.find((x) => x.key === v)!;
                return active
                  ? `${c.tone} border-current font-bold`
                  : "bg-surface-container-low text-on-surface-variant border-border-subtle hover:bg-surface-container";
              }}
            />
          </Field>

          <Field label="Status">
            <PillRow
              value={draft.status}
              options={STATUSES}
              disabled={!isAdmin}
              onChange={(v) => set("status", v, "Status updated")}
            />
          </Field>

          <Field label="Priority">
            <PillRow
              value={draft.priority ?? "Medium"}
              options={PRIORITIES}
              disabled={!isAdmin}
              onChange={(v) => set("priority", v, "Priority updated")}
              toneFor={priorityTone}
            />
          </Field>

          <Field label="Sprint">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={draft.inSprint}
                  disabled={!isAdmin}
                  onChange={(e) => set("inSprint", e.target.checked, e.target.checked ? "Added to sprint" : "Removed from sprint")}
                  className="accent-primary"
                />
                In sprint
              </label>
              <input
                value={draft.sprint ?? ""}
                disabled={!isAdmin || !draft.inSprint}
                onChange={(e) => set("sprint", e.target.value)}
                onBlur={() => draft.inSprint && toast.success("Saved", { duration: 800 })}
                placeholder="Sprint name"
                className="flex-1 px-2 py-1 text-xs rounded-md bg-surface-container-low border border-border-subtle disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Currently with">
              <PersonInput
                value={draft.currentlyWithName}
                onChange={(v) => set("currentlyWithName", v)}
                disabled={!isAdmin}
              />
            </Field>
            <Field label="Tech owner">
              <PersonInput
                value={draft.techOwnerName}
                onChange={(v) => set("techOwnerName", v)}
                disabled={!isAdmin}
              />
            </Field>
            <Field label="Business owner" className="col-span-2">
              <PersonInput
                value={draft.businessOwnerName}
                onChange={(v) => set("businessOwnerName", v)}
                disabled={!isAdmin}
              />
            </Field>
          </div>

          <Field label="Latest update">
            <textarea
              value={draft.latestUpdateText}
              disabled={!isAdmin}
              onChange={(e) => setDraft({ ...draft, latestUpdateText: e.target.value })}
              onBlur={() => isAdmin && autosave(draft, "Update logged")}
              rows={3}
              placeholder="What changed?"
              className="w-full px-2.5 py-2 text-xs rounded-md bg-surface-container-low border border-border-subtle resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="text-[10px] text-on-surface-variant mt-1">
              Last: {new Date(task.latestUpdate.at).toLocaleString()}
            </p>
          </Field>

          {isAdmin && (
            <button
              onClick={onDelete}
              className="w-full mt-2 px-3 py-2 rounded-md text-xs font-semibold text-status-critical border border-status-critical/30 hover:bg-status-critical/10 inline-flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined !text-[16px]">delete</span>
              Delete task
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}

function PersonInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => !disabled && toast.success("Saved", { duration: 800 })}
      placeholder="Person name"
      className="w-full px-2 py-1.5 text-xs rounded-md bg-surface-container-low border border-border-subtle disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/40"
    />
  );
}
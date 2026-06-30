import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, inputCls, labelCls } from "./Dialog";
import {
  applyTaskDraft,
  createTask,
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

const STATUSES: Status[] = ["On Track", "In Progress", "Blocked", "Delayed", "Completed"];
const PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Low"];
const COLUMNS: { key: BoardColumn; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "prio", label: "Prioritized" },
  { key: "sprint", label: "In Current Sprint" },
  { key: "progress", label: "In Progress" },
  { key: "blocked", label: "Blocked" },
  { key: "uat", label: "UAT" },
  { key: "done", label: "Done" },
];

const blankDraft: TaskDraft = {
  name: "",
  status: "On Track",
  inSprint: false,
  sprint: "",
  currentlyWithName: "",
  techOwnerName: "",
  businessOwnerName: "",
  latestUpdateText: "",
  priority: "Medium",
  boardColumn: undefined,
};

export function TaskEditDialog({
  open,
  onClose,
  projectId,
  task,
  defaultProjectId,
  defaultBoardColumn,
}: {
  open: boolean;
  onClose: () => void;
  projectId?: string; // present when editing
  task: Task | null; // null = create mode
  defaultProjectId?: string;
  defaultBoardColumn?: BoardColumn;
}) {
  const [draft, setDraft] = useState<TaskDraft>(blankDraft);
  const [pickedProjectId, setPickedProjectId] = useState<string>(
    defaultProjectId ?? projects[0]?.id ?? "",
  );

  useEffect(() => {
    if (!open) return;
    if (task) {
      setDraft(taskToDraft(task));
    } else {
      setDraft({
        ...blankDraft,
        boardColumn: defaultBoardColumn,
        inSprint:
          defaultBoardColumn === "sprint" ||
          defaultBoardColumn === "progress" ||
          defaultBoardColumn === "blocked" ||
          defaultBoardColumn === "uat",
      });
    }
    setPickedProjectId(projectId ?? defaultProjectId ?? projects[0]?.id ?? "");
  }, [open, task, projectId, defaultProjectId, defaultBoardColumn]);

  const set = <K extends keyof TaskDraft>(k: K, v: TaskDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const targetProject = useMemo(
    () => projects.find((p) => p.id === (projectId ?? pickedProjectId)),
    [projectId, pickedProjectId],
  );

  const save = () => {
    if (!draft.name.trim()) {
      toast.error("Task title is required");
      return;
    }
    if (task && projectId) {
      applyTaskDraft(projectId, task.id, draft);
      if (draft.boardColumn) moveTaskColumn(projectId, task.id, draft.boardColumn);
      toast.success("Task updated");
    } else {
      const pid = projectId ?? pickedProjectId;
      if (!pid) {
        toast.error("Pick a project for this task");
        return;
      }
      const created = createTask(pid, draft);
      if (created && draft.boardColumn) moveTaskColumn(pid, created.id, draft.boardColumn);
      toast.success("Task created");
    }
    onClose();
  };

  const remove = () => {
    if (!task || !projectId) return;
    if (!confirm(`Delete task "${task.name}"?`)) return;
    deleteTask(projectId, task.id);
    toast.success("Task deleted");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={task ? "Edit task" : "New task"}
      subtitle={
        task
          ? `${task.id}${targetProject ? ` · ${targetProject.name}` : ""}`
          : "Admin Mode · adding to sprint board / portfolio"
      }
      footer={
        <>
          {task && (
            <button
              onClick={remove}
              className="mr-auto px-3 py-1.5 rounded-lg text-xs font-bold text-status-critical hover:bg-status-critical/10 inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90"
          >
            {task ? "Save changes" : "Create task"}
          </button>
        </>
      }
    >
      <div>
        <label className={labelCls}>Title</label>
        <input
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputCls}
          placeholder="e.g. Telemetry schema v2"
          autoFocus
        />
      </div>

      {!task && !projectId && (
        <div>
          <label className={labelCls}>Project</label>
          <select
            value={pickedProjectId}
            onChange={(e) => setPickedProjectId(e.target.value)}
            className={inputCls}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Board column</label>
          <select
            value={draft.boardColumn ?? ""}
            onChange={(e) =>
              set("boardColumn", (e.target.value || undefined) as BoardColumn | undefined)
            }
            className={inputCls}
          >
            <option value="">Auto (derive from status)</option>
            {COLUMNS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select
            value={draft.status}
            onChange={(e) => set("status", e.target.value as Status)}
            className={inputCls}
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Priority</label>
          <select
            value={draft.priority ?? "Medium"}
            onChange={(e) => set("priority", e.target.value as Priority)}
            className={inputCls}
          >
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Sprint</label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.inSprint}
              onChange={(e) => set("inSprint", e.target.checked)}
              className="accent-primary"
              id="task-in-sprint"
            />
            <input
              value={draft.sprint ?? ""}
              disabled={!draft.inSprint}
              onChange={(e) => set("sprint", e.target.value)}
              placeholder="e.g. Current Sprint"
              className={`${inputCls} ${!draft.inSprint ? "opacity-50" : ""}`}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Currently with</label>
          <input
            value={draft.currentlyWithName}
            onChange={(e) => set("currentlyWithName", e.target.value)}
            className={inputCls}
            placeholder="Person name"
          />
        </div>
        <div>
          <label className={labelCls}>Tech owner</label>
          <input
            value={draft.techOwnerName}
            onChange={(e) => set("techOwnerName", e.target.value)}
            className={inputCls}
            placeholder="Person name"
          />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Business owner</label>
          <input
            value={draft.businessOwnerName}
            onChange={(e) => set("businessOwnerName", e.target.value)}
            className={inputCls}
            placeholder="Person name"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Latest update</label>
        <textarea
          value={draft.latestUpdateText}
          onChange={(e) => set("latestUpdateText", e.target.value)}
          rows={3}
          className={inputCls}
          placeholder="What changed? Adding a note bumps the task's timestamp."
        />
      </div>
    </Dialog>
  );
}
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, inputCls, labelCls } from "./Dialog";
import {
  applyProjectDraft,
  createProject,
  deleteProject,
  projectToDraft,
  type ProjectDraft,
} from "@/lib/store";
import type { Priority, Project, Status, Workstream } from "@/data/projects";

const STATUSES: Status[] = ["On Track", "In Progress", "Blocked", "Delayed", "Completed"];
const PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Low"];
const WORKSTREAMS: Workstream[] = ["OX", "EX", "AU", "DW"];

const blankDraft: ProjectDraft = {
  name: "",
  workstream: "OX",
  status: "On Track",
  priority: "Medium",
  techOwnerName: "",
  businessOwnerName: "",
  currentlyWithName: "",
  latestUpdateText: "",
};

export function ProjectEditDialog({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project: Project | null; // null = create mode
}) {
  const [draft, setDraft] = useState<ProjectDraft>(blankDraft);

  useEffect(() => {
    if (!open) return;
    setDraft(project ? projectToDraft(project) : blankDraft);
  }, [open, project]);

  const set = <K extends keyof ProjectDraft>(k: K, v: ProjectDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    if (!draft.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (project) {
      applyProjectDraft(project.id, draft);
      toast.success(`${draft.name} updated`);
    } else {
      const p = createProject(draft);
      toast.success(`${p.name} created`);
    }
    onClose();
  };

  const remove = () => {
    if (!project) return;
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    deleteProject(project.id);
    toast.success("Project deleted");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={project ? "Edit project" : "New project"}
      subtitle={project ? project.eid : "Admin Mode · adding to portfolio"}
      footer={
        <>
          {project && (
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
            {project ? "Save changes" : "Create project"}
          </button>
        </>
      }
    >
      <div>
        <label className={labelCls}>Name</label>
        <input
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputCls}
          placeholder="e.g. Fero Auto-Plan v2"
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Workstream</label>
          <select value={draft.workstream} onChange={(e) => set("workstream", e.target.value as Workstream)} className={inputCls}>
            {WORKSTREAMS.map((w) => <option key={w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select value={draft.status} onChange={(e) => set("status", e.target.value as Status)} className={inputCls}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Priority</label>
          <select value={draft.priority} onChange={(e) => set("priority", e.target.value as Priority)} className={inputCls}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Currently with</label>
          <input value={draft.currentlyWithName} onChange={(e) => set("currentlyWithName", e.target.value)} className={inputCls} placeholder="Person name" />
        </div>
        <div>
          <label className={labelCls}>Tech owner</label>
          <input value={draft.techOwnerName} onChange={(e) => set("techOwnerName", e.target.value)} className={inputCls} placeholder="Person name" />
        </div>
        <div>
          <label className={labelCls}>Business owner</label>
          <input value={draft.businessOwnerName} onChange={(e) => set("businessOwnerName", e.target.value)} className={inputCls} placeholder="Person name" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Latest update</label>
        <textarea
          value={draft.latestUpdateText}
          onChange={(e) => set("latestUpdateText", e.target.value)}
          rows={3}
          className={inputCls}
          placeholder="What changed? Adding a note bumps the project's timestamp."
        />
      </div>
    </Dialog>
  );
}
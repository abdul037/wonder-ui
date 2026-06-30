import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, inputCls, labelCls } from "./Dialog";
import {
  applyPipelineDraft,
  createPipeline,
  deletePipeline,
  pipelineToDraft,
  promotePipeline,
  type PipelineDraft,
} from "@/lib/store";
import type { Priority, Workstream } from "@/data/projects";
import {
  pipelineEfforts,
  pipelineSources,
  pipelineStages,
  type PipelineEffort,
  type PipelineItem,
  type PipelineSource,
  type PipelineStage,
} from "@/data/pipeline";

const PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Low"];
const WORKSTREAMS: Workstream[] = ["OX", "EX", "AU", "DW"];

const blank: PipelineDraft = {
  name: "",
  description: "",
  workstream: "OX",
  stage: "Idea",
  priority: "Medium",
  effort: "Medium",
  source: "Business Request",
  expectedStart: new Date().toISOString().slice(0, 10),
  businessOwnerName: "",
  techOwnerName: "",
};

export function PipelineEditDialog({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: PipelineItem | null;
}) {
  const [draft, setDraft] = useState<PipelineDraft>(blank);

  useEffect(() => {
    if (!open) return;
    setDraft(item ? pipelineToDraft(item) : blank);
  }, [open, item]);

  const set = <K extends keyof PipelineDraft>(k: K, v: PipelineDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    if (!draft.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (item) {
      applyPipelineDraft(item.id, draft);
      toast.success("Intake updated");
    } else {
      const i = createPipeline(draft);
      toast.success(`${i.id} added to pipeline`);
    }
    onClose();
  };

  const remove = () => {
    if (!item) return;
    if (!confirm(`Delete intake "${item.name}"?`)) return;
    deletePipeline(item.id);
    toast.success("Intake removed");
    onClose();
  };

  const promote = () => {
    if (!item) return;
    const p = promotePipeline(item.id);
    if (p) toast.success(`${p.name} promoted to active project`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={item ? "Edit intake" : "New intake"}
      subtitle={item ? `${item.id} · ${item.source}` : "Admin Mode · pipeline"}
      footer={
        <>
          {item && (
            <>
              <button
                onClick={remove}
                className="mr-auto px-3 py-1.5 rounded-lg text-xs font-bold text-status-critical hover:bg-status-critical/10 inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Delete
              </button>
              <button
                onClick={promote}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">north_east</span>
                Promote
              </button>
            </>
          )}
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container">
            Cancel
          </button>
          <button onClick={save} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90">
            {item ? "Save changes" : "Create intake"}
          </button>
        </>
      }
    >
      <div>
        <label className={labelCls}>Name</label>
        <input value={draft.name} onChange={(e) => set("name", e.target.value)} className={inputCls} autoFocus />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea value={draft.description} onChange={(e) => set("description", e.target.value)} rows={3} className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Workstream</label>
          <select value={draft.workstream} onChange={(e) => set("workstream", e.target.value as Workstream)} className={inputCls}>
            {WORKSTREAMS.map((w) => <option key={w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Stage</label>
          <select value={draft.stage} onChange={(e) => set("stage", e.target.value as PipelineStage)} className={inputCls}>
            {pipelineStages.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Priority</label>
          <select value={draft.priority} onChange={(e) => set("priority", e.target.value as Priority)} className={inputCls}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Effort</label>
          <select value={draft.effort} onChange={(e) => set("effort", e.target.value as PipelineEffort)} className={inputCls}>
            {pipelineEfforts.map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Source</label>
          <select value={draft.source} onChange={(e) => set("source", e.target.value as PipelineSource)} className={inputCls}>
            {pipelineSources.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Expected start</label>
          <input type="date" value={draft.expectedStart} onChange={(e) => set("expectedStart", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Business owner</label>
          <input value={draft.businessOwnerName} onChange={(e) => set("businessOwnerName", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Tech owner</label>
          <input value={draft.techOwnerName} onChange={(e) => set("techOwnerName", e.target.value)} className={inputCls} />
        </div>
      </div>
    </Dialog>
  );
}
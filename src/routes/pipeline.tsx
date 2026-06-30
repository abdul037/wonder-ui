import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  pipelineItems,
  pipelineStages,
  pipelineSources,
  pipelineStageColor,
  type PipelineItem,
  type PipelineStage,
  type PipelineSource,
} from "@/data/pipeline";
import { workstreamFullName, type Workstream, type Priority } from "@/data/projects";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline / Intake | Supply Chain Tech Hub" },
      {
        name: "description",
        content:
          "Demand intake board — ideas, business requests, and mandates queued for promotion into active SCM projects.",
      },
      { property: "og:title", content: "Pipeline / Intake | Supply Chain Tech Hub" },
      {
        property: "og:description",
        content: "Track expected SCM projects from idea to scheduled across all four workstreams.",
      },
    ],
  }),
  component: PipelinePage,
});

const ALL_WS: (Workstream | "ALL")[] = ["ALL", "OX", "EX", "AU", "DW"];
const priorities: (Priority | "ALL")[] = ["ALL", "Critical", "High", "Medium", "Low"];
const sources: (PipelineSource | "ALL")[] = ["ALL", ...pipelineSources];
const stages: (PipelineStage | "ALL")[] = ["ALL", ...pipelineStages];

const priColor: Record<Priority, string> = {
  Critical: "status-critical",
  High: "status-critical",
  Medium: "status-medium",
  Low: "status-low",
};

function ItemCard({ item }: { item: PipelineItem }) {
  const ws = item.workstream.toLowerCase();
  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-workstream-${ws}/10 text-workstream-${ws}`}>
          {item.workstream}
        </span>
        <span className="font-mono text-[10px] text-on-surface-variant">{item.id}</span>
      </div>
      <h3 className="text-sm font-bold text-on-surface leading-snug">{item.name}</h3>
      <p className="text-xs text-on-surface-variant line-clamp-2">{item.description}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-${priColor[item.priority]}/10 text-${priColor[item.priority]}`}>
          {item.priority}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-on-surface-variant">
          Effort · {item.effort}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-on-surface-variant">
          {item.source}
        </span>
      </div>
      <div className="flex items-center justify-between mt-1 pt-3 border-t border-border-subtle">
        <div className="flex -space-x-2">
          <div
            title={`Business · ${item.businessOwner.name}`}
            className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-[10px] font-bold ring-2 ring-surface-card"
          >
            {item.businessOwner.initials}
          </div>
          <div
            title={`Tech · ${item.techOwner.name}`}
            className={`w-7 h-7 rounded-full bg-workstream-${ws}/20 text-workstream-${ws} flex items-center justify-center text-[10px] font-bold ring-2 ring-surface-card`}
          >
            {item.techOwner.initials}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant">Expected</p>
          <p className="font-mono text-[11px] text-on-surface font-bold">
            {new Date(item.expectedStart).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>
      <Link
        to="/admin"
        className="text-[11px] font-bold text-primary hover:underline self-end inline-flex items-center gap-1"
      >
        Promote to Active
        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </Link>
    </div>
  );
}

function PipelinePage() {
  const [view, setView] = useState<"board" | "list">("board");
  const [ws, setWs] = useState<(typeof ALL_WS)[number]>("ALL");
  const [stage, setStage] = useState<(typeof stages)[number]>("ALL");
  const [pri, setPri] = useState<(typeof priorities)[number]>("ALL");
  const [src, setSrc] = useState<(typeof sources)[number]>("ALL");

  const scoped = useMemo(
    () =>
      pipelineItems.filter(
        (i) =>
          (ws === "ALL" || i.workstream === ws) &&
          (stage === "ALL" || i.stage === stage) &&
          (pri === "ALL" || i.priority === pri) &&
          (src === "ALL" || i.source === src),
      ),
    [ws, stage, pri, src],
  );

  return (
    <AppShell>
      <div className="px-8 py-8 space-y-6 pb-24">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">Demand · Intake</p>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Pipeline / Intake</h1>
            <p className="text-xs text-on-surface-variant mt-1">
              {pipelineItems.length} expected projects across the four workstreams · waiting to be scoped, approved, or scheduled.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl">
              {(["board", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    view === v ? "bg-surface-card shadow-sm text-on-surface" : "text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">
                    {v === "board" ? "view_kanban" : "list"}
                  </span>
                  {v === "board" ? "Board" : "List"}
                </button>
              ))}
            </div>
            <Link
              to="/admin"
              className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New intake
            </Link>
          </div>
        </header>

        {/* Filter bar */}
        <section className="bg-surface-card border border-border-subtle rounded-xl p-3 flex flex-wrap items-center gap-3 shadow-sm">
          <FilterGroup label="Workstream" value={ws} options={ALL_WS} onChange={(v) => setWs(v as typeof ws)} render={(o) => (o === "ALL" ? "All" : `${workstreamFullName[o as Workstream]} (${o})`)} />
          <FilterGroup label="Stage" value={stage} options={stages} onChange={(v) => setStage(v as typeof stage)} render={(o) => (o === "ALL" ? "All stages" : o)} />
          <FilterGroup label="Priority" value={pri} options={priorities} onChange={(v) => setPri(v as typeof pri)} render={(o) => (o === "ALL" ? "All priorities" : o)} />
          <FilterGroup label="Source" value={src} options={sources} onChange={(v) => setSrc(v as typeof src)} render={(o) => (o === "ALL" ? "All sources" : o)} />
          <span className="ml-auto text-[11px] text-on-surface-variant font-mono">
            {scoped.length}/{pipelineItems.length} matching
          </span>
        </section>

        {view === "board" ? (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {pipelineStages.map((s) => {
              const colItems = scoped.filter((i) => i.stage === s);
              const color = pipelineStageColor[s];
              return (
                <div key={s} className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-3 min-h-[300px]">
                  <header className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full bg-${color}`} />
                      <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface">{s}</h2>
                    </div>
                    <span className="font-mono text-[10px] text-on-surface-variant">{colItems.length}</span>
                  </header>
                  <div className="space-y-3">
                    {colItems.length === 0 && (
                      <p className="text-[11px] text-on-surface-variant text-center py-8">No items.</p>
                    )}
                    {colItems.map((i) => (
                      <ItemCard key={i.id} item={i} />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <section className="bg-surface-card border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant text-[10px] uppercase tracking-wider">
                    <th className="text-left font-bold px-3 py-2.5">Intake</th>
                    <th className="text-left font-bold px-3 py-2.5">WS</th>
                    <th className="text-left font-bold px-3 py-2.5">Stage</th>
                    <th className="text-left font-bold px-3 py-2.5">Priority</th>
                    <th className="text-left font-bold px-3 py-2.5">Effort</th>
                    <th className="text-left font-bold px-3 py-2.5">Source</th>
                    <th className="text-left font-bold px-3 py-2.5">Owners</th>
                    <th className="text-left font-bold px-3 py-2.5">Expected start</th>
                  </tr>
                </thead>
                <tbody>
                  {scoped.map((i) => {
                    const w = i.workstream.toLowerCase();
                    return (
                      <tr key={i.id} className="border-t border-border-subtle hover:bg-surface-container/50">
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-on-surface">{i.name}</div>
                          <div className="font-mono text-[10px] text-on-surface-variant">{i.id}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold bg-workstream-${w}/10 text-workstream-${w}`}>
                            {i.workstream}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-${pipelineStageColor[i.stage]}/10 text-${pipelineStageColor[i.stage]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-${pipelineStageColor[i.stage]}`} />
                            {i.stage}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-${priColor[i.priority]}/10 text-${priColor[i.priority]}`}>
                            {i.priority}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-on-surface-variant">{i.effort}</td>
                        <td className="px-3 py-2.5 text-on-surface-variant">{i.source}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex -space-x-2">
                            <span title={`Business · ${i.businessOwner.name}`} className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-[9px] font-bold ring-2 ring-surface-card">
                              {i.businessOwner.initials}
                            </span>
                            <span title={`Tech · ${i.techOwner.name}`} className={`w-6 h-6 rounded-full bg-workstream-${w}/20 text-workstream-${w} flex items-center justify-center text-[9px] font-bold ring-2 ring-surface-card`}>
                              {i.techOwner.initials}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-on-surface">
                          {new Date(i.expectedStart).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    );
                  })}
                  {scoped.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-on-surface-variant">
                        No intake items match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  render,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  render: (o: T) => string;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px]">
      <span className="uppercase tracking-widest text-on-surface-variant font-bold">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-surface-container-low border border-border-subtle rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-primary outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {render(o)}
          </option>
        ))}
      </select>
    </label>
  );
}
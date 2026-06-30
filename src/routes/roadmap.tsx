import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { projects, workstreamLabel } from "@/data/projects";
import type { Project } from "@/data/projects";
import { useIsAdmin } from "@/lib/admin";
import { useDataVersion } from "@/lib/store";
import { ProjectEditDialog } from "@/components/admin-edit/ProjectEditDialog";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap | Supply Chain Tech Hub" },
      { name: "description", content: "Multi-quarter roadmap across operational excellence, executive strategy, automation and data warehouse workstreams." },
      { property: "og:title", content: "Roadmap | Supply Chain Tech Hub" },
      { property: "og:description", content: "Multi-quarter strategic roadmap across workstreams." },
    ],
  }),
  component: Roadmap,
});

const quarters = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"];

function Roadmap() {
  const isAdmin = useIsAdmin();
  useDataVersion();
  const [editing, setEditing] = useState<Project | null>(null);
  const byWs = (["OX", "EX", "AU", "DW"] as const).map((ws) => ({
    ws,
    items: projects.filter((p) => p.workstream === ws),
  }));

  return (
    <AppShell>
      <div className="px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <p className="eyebrow">Multi-Quarter View</p>
            <h2 className="page-title mt-1">Strategic Roadmap</h2>
            <p className="text-on-surface-variant text-xs mt-1">
              Quarterly view of cross-workstream initiatives and milestones.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container p-1 rounded-lg">
            {["Quarter", "Year", "Multi-Year"].map((r, i) => (
              <button
                key={r}
                className={`px-4 py-1.5 rounded text-xs font-medium ${
                  i === 0 ? "bg-surface-card shadow-sm text-primary" : "text-on-surface-variant"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5 text-xs flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-primary text-[18px]">info</span>
          For the full Muwahib readout (Active · BAU · Pipeline), see the
          <a href="/unified-roadmap" className="text-primary font-semibold underline">Unified Roadmap</a>.
        </div>

        <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[200px_repeat(4,1fr)] border-b border-border-subtle bg-surface-container-low text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            <div className="px-4 py-3">Workstream</div>
            {quarters.map((q) => (
              <div key={q} className="px-4 py-3 border-l border-border-subtle">
                {q}
              </div>
            ))}
          </div>
          {byWs.map(({ ws, items }) => {
            const w = ws.toLowerCase();
            return (
              <div key={ws} className="grid grid-cols-[200px_repeat(4,1fr)] border-b border-border-subtle last:border-0 min-h-[110px]">
                <div className="px-4 py-4 flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full bg-workstream-${w}`} />
                  <div>
                    <p className="font-bold text-sm">{ws}</p>
                    <p className="text-[11px] text-on-surface-variant">{workstreamLabel[ws].split(" (")[0]}</p>
                  </div>
                </div>
                {quarters.map((q, qi) => {
                  const item = items[qi];
                  if (!item) return <div key={q} className="border-l border-border-subtle px-3 py-3" />;
                  return (
                    <div key={q} className="border-l border-border-subtle px-3 py-3">
                      <div className={`relative rounded-lg p-3 bg-workstream-${w}/5 border border-workstream-${w}/20`}>
                        {isAdmin && (
                          <button
                            onClick={() => setEditing(item)}
                            title="Edit project"
                            className="absolute top-1.5 right-1.5 text-primary bg-surface-card border border-border-subtle rounded p-0.5 hover:bg-primary/10"
                          >
                            <span className="material-symbols-outlined text-[12px]">edit</span>
                          </button>
                        )}
                        <p className="text-xs font-bold text-on-surface pr-5">{item.name}</p>
                        <p className="text-[10px] text-on-surface-variant mt-1">{item.taskName}</p>
                        <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden mt-2">
                          <div
                            className={`bg-workstream-${w} h-full`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["OX", "EX", "DW"] as const).map((ws) => {
            const w = ws.toLowerCase();
            return (
              <div
                key={ws}
                className={`bg-surface-card border border-border-subtle rounded-xl p-4 border-t-4 border-t-workstream-${w}`}
              >
                <p className="eyebrow">{workstreamLabel[ws]}</p>
                <p className="kpi-num mt-1.5">
                  {projects.filter((p) => p.workstream === ws).length}
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">active initiatives</p>
              </div>
            );
          })}
        </div>
      </div>
      <ProjectEditDialog open={!!editing} onClose={() => setEditing(null)} project={editing} />
    </AppShell>
  );
}
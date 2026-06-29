import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { projects, workstreamLabel } from "@/data/projects";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap | PMO Command Center" },
      { name: "description", content: "Multi-quarter roadmap across operational excellence, executive strategy, automation and data warehouse workstreams." },
      { property: "og:title", content: "Roadmap | PMO Command Center" },
      { property: "og:description", content: "Multi-quarter strategic roadmap across workstreams." },
    ],
  }),
  component: Roadmap,
});

const quarters = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"];

function Roadmap() {
  const byWs = (["OX", "EX", "AU", "DW"] as const).map((ws) => ({
    ws,
    items: projects.filter((p) => p.workstream === ws),
  }));

  return (
    <AppShell>
      <div className="px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h2 className="text-4xl font-black text-on-surface">Strategic Roadmap</h2>
            <p className="text-on-surface-variant text-base mt-1">
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
                      <div className={`rounded-lg p-3 bg-workstream-${w}/5 border border-workstream-${w}/20`}>
                        <p className="text-xs font-bold text-on-surface">{item.name}</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["OX", "EX", "DW"] as const).map((ws) => {
            const w = ws.toLowerCase();
            return (
              <div
                key={ws}
                className={`bg-surface-card border border-border-subtle rounded-xl p-6 border-t-4 border-t-workstream-${w}`}
              >
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{workstreamLabel[ws]}</p>
                <p className="text-3xl font-black mt-2">
                  {projects.filter((p) => p.workstream === ws).length}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">active initiatives</p>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
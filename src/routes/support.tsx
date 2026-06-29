import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support | PMO Command Center" },
      { name: "description", content: "Documentation, help articles, and contact options for PMO Command Center." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <AppShell>
      <div className="px-8 py-8 max-w-4xl">
        <h2 className="text-4xl font-black text-on-surface">Support</h2>
        <p className="text-on-surface-variant mt-1">Documentation and direct lines to the PMO operations team.</p>
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {[
            { i: "menu_book", t: "Documentation", d: "Architecture, conventions and FAQ." },
            { i: "support_agent", t: "Talk to PMO Ops", d: "Schedule a 15-minute sync." },
            { i: "bug_report", t: "Report an issue", d: "File a ticket with screenshots." },
            { i: "rocket_launch", t: "Request a feature", d: "Shape the roadmap." },
          ].map((c) => (
            <div key={c.t} className="bg-surface-card border border-border-subtle rounded-xl p-6 hover:border-primary/40 transition-colors">
              <span className="material-symbols-outlined text-primary">{c.i}</span>
              <h3 className="font-bold mt-3">{c.t}</h3>
              <p className="text-sm text-on-surface-variant mt-1">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
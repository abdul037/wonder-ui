import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ImportWizard } from "@/components/ImportWizard";
import { updates, type UpdateEntry } from "@/data/newsletter";
import type { Workstream } from "@/data/projects";
import { addUpdate, deleteUpdate, useDataVersion } from "@/lib/store";
import { setAdminMode, useIsAdmin } from "@/lib/admin";
import { relativeTime } from "@/lib/time";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Workspace | Supply Chain Tech Hub" },
      { name: "description", content: "Newsletter publishing and bulk data import for the SCM Tech Hub." },
    ],
  }),
  component: AdminPage,
});

type TabKey = "newsletter" | "import";

const tabs: { key: TabKey; label: string; icon: string; desc: string }[] = [
  { key: "newsletter", label: "Newsletter", icon: "campaign", desc: "Compose and publish product updates" },
  { key: "import", label: "Import Data", icon: "upload_file", desc: "Bulk upload projects, tasks, and milestones" },
];

function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-${tone}/10 text-${tone}`}>
      {children}
    </span>
  );
}

function AdminPage() {
  const [tab, setTab] = useState<TabKey>("newsletter");
  const isAdmin = useIsAdmin();

  return (
    <AppShell>
      <div className="px-8 py-8 space-y-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-status-medium/10 text-status-medium text-[10px] font-bold uppercase tracking-widest">
                Internal
              </span>
              <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">
                Admin Workspace
              </span>
            </div>
            <h1 className="text-4xl font-black text-on-surface mt-1">Newsletter &amp; Import</h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              Project, task and pipeline editing now happens directly on the dashboards. Turn on{" "}
              <button
                onClick={() => setAdminMode(!isAdmin)}
                className={`underline font-bold ${isAdmin ? "text-status-medium" : "text-primary"}`}
              >
                Admin mode
              </button>{" "}
              in the top bar to edit Portfolio, Pipeline, Sprint Board and Period Roadmap inline.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { to: "/portfolio", icon: "folder_special", label: "Portfolio" },
              { to: "/pipeline", icon: "pending_actions", label: "Pipeline" },
              { to: "/sprint-board", icon: "view_kanban", label: "Sprint Board" },
              { to: "/roadmap", icon: "map", label: "Period Roadmap" },
            ].map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-medium hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined !text-[16px]">{q.icon}</span>
                {q.label}
              </Link>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <nav className="bg-surface-card border border-border-subtle rounded-xl p-2 h-fit lg:sticky lg:top-20">
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`w-full text-left px-3 py-3 rounded-lg flex items-start gap-3 transition-all ${
                    active ? "bg-primary-fixed text-on-primary-fixed" : "text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined">{t.icon}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{t.label}</span>
                    <span className={`block text-[11px] ${active ? "opacity-80" : "text-on-surface-variant"}`}>{t.desc}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <section className="min-w-0">
            {tab === "newsletter" && <NewsletterAdmin />}
            {tab === "import" && <ImportWizard />}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

/* -------------------- Newsletter -------------------- */

function NewsletterAdmin() {
  useDataVersion();
  const [form, setForm] = useState({
    title: "",
    summary: "",
    body: "",
    workstream: "OX" as Workstream,
    tag: "Enhancement" as UpdateEntry["tag"],
    featured: false,
    author: "Marcus Sterling",
  });

  const publish = () => {
    if (!form.title.trim() || !form.summary.trim()) {
      toast.error("Title and summary are required");
      return;
    }
    const u: UpdateEntry = {
      id: `u-${Date.now()}`,
      title: form.title,
      summary: form.summary,
      body: form.body || form.summary,
      workstream: form.workstream,
      tag: form.tag,
      featured: form.featured,
      author: {
        name: form.author,
        initials: form.author.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase(),
      },
      publishedAt: new Date().toISOString(),
    };
    addUpdate(u);
    setForm({ ...form, title: "", summary: "", body: "" });
    toast.success("Update published to newsletter");
  };

  const remove = (id: string) => {
    deleteUpdate(id);
    toast.success("Update removed");
  };

  const inputCls =
    "w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <div className="bg-surface-card border border-border-subtle rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border-subtle">
          <h2 className="text-lg font-bold">Published Updates ({updates.length})</h2>
          <p className="text-xs text-on-surface-variant">Posts appear in the SCM Tech Pulse newsletter feed.</p>
        </div>
        <ul className="divide-y divide-border-subtle">
          {updates.map((u) => (
            <li key={u.id} className="p-5 flex gap-4 hover:bg-surface-container-low">
              <div className={`w-1 self-stretch rounded bg-workstream-${u.workstream.toLowerCase()}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Pill tone={`workstream-${u.workstream.toLowerCase()}`}>{u.workstream}</Pill>
                  {u.tag && <Pill tone="primary">{u.tag}</Pill>}
                  {u.featured && <Pill tone="status-medium">Featured</Pill>}
                  <span className="text-[11px] text-on-surface-variant ml-auto">{relativeTime(u.publishedAt)}</span>
                </div>
                <p className="font-bold text-on-surface mt-2">{u.title}</p>
                <p className="text-sm text-on-surface-variant">{u.summary}</p>
              </div>
              <button onClick={() => remove(u.id)} className="text-status-critical hover:bg-status-critical/10 rounded p-1 h-fit">
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </li>
          ))}
          {updates.length === 0 && (
            <li className="p-6 text-center text-sm text-on-surface-variant">No updates published yet.</li>
          )}
        </ul>
      </div>

      <aside className="bg-surface-card border border-border-subtle rounded-xl shadow-sm p-5 space-y-3 h-fit lg:sticky lg:top-20">
        <h3 className="font-bold">Compose Update</h3>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
        <textarea
          placeholder="Summary (1–2 lines)"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          className={`${inputCls} min-h-[70px]`}
        />
        <textarea
          placeholder="Body (optional, longer detail)"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          className={`${inputCls} min-h-[100px]`}
        />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.workstream} onChange={(e) => setForm({ ...form, workstream: e.target.value as Workstream })} className={inputCls}>
            {(["OX", "EX", "AU", "DW"] as Workstream[]).map((w) => <option key={w}>{w}</option>)}
          </select>
          <select
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value as UpdateEntry["tag"] })}
            className={inputCls}
          >
            {(["Release", "Enhancement", "Heads Up", "Roadblocker Cleared"] as const).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <input
          placeholder="Author"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          className={inputCls}
        />
        <label className="flex items-center gap-2 text-xs text-on-surface-variant">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Feature in newsletter hero
        </label>
        <button onClick={publish} className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:opacity-90 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base">send</span>
          Publish update
        </button>
      </aside>
    </div>
  );
}
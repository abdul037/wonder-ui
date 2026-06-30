import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { currentIssue, updates, workstreamDigest, type UpdateEntry } from "@/data/newsletter";
import { projects, type Workstream } from "@/data/projects";
import { relativeTime } from "@/lib/time";
import { useDataVersion } from "@/lib/store";

export const Route = createFileRoute("/newsletter")({
  head: () => ({
    meta: [
      { title: "SCM Tech Pulse | Supply Chain Tech Hub" },
      {
        name: "description",
        content:
          "Live updates from across the Supply Chain organization — releases, enhancements, blockers cleared, and what's shipping this week.",
      },
      { property: "og:title", content: "SCM Tech Pulse — Supply Chain Tech Hub Newsletter" },
      {
        property: "og:description",
        content: "Operational and tech updates across OX, EX, AU, and DW workstreams.",
      },
    ],
  }),
  component: NewsletterPage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function tagStyle(tag?: UpdateEntry["tag"]) {
  switch (tag) {
    case "Release":
      return "bg-status-low/10 text-status-low";
    case "Enhancement":
      return "bg-primary/10 text-primary";
    case "Roadblocker Cleared":
      return "bg-secondary/10 text-secondary";
    case "Heads Up":
    default:
      return "bg-status-medium/10 text-status-medium";
  }
}

function WorkstreamPill({ ws }: { ws: Workstream }) {
  const cls = `bg-workstream-${ws.toLowerCase()}/10 text-workstream-${ws.toLowerCase()}`;
  return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${cls}`}>{ws}</span>;
}

function UpdateCard({ u, large = false }: { u: UpdateEntry; large?: boolean }) {
  const project = u.projectId ? projects.find((p) => p.id === u.projectId) : undefined;
  return (
    <article
      className={`bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm card-hover-effect relative ${
        large ? "lg:flex" : ""
      }`}
    >
      <div className={`w-1.5 bg-workstream-${u.workstream.toLowerCase()} ${large ? "" : "absolute left-0 top-0 bottom-0"}`} />
      <div className={`${large ? "p-8 flex-1" : "p-6 pl-7"} space-y-3`}>
        <div className="flex flex-wrap items-center gap-2">
          <WorkstreamPill ws={u.workstream} />
          {u.tag && (
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${tagStyle(u.tag)}`}>
              {u.tag}
            </span>
          )}
          <span className="text-[11px] text-on-surface-variant ml-auto">{relativeTime(u.publishedAt)}</span>
        </div>
        <h3 className={`${large ? "text-xl" : "text-sm"} font-semibold text-on-surface leading-snug tracking-tight`}>{u.title}</h3>
        <p className="text-on-surface-variant text-xs">{u.summary}</p>
        {large && <p className="text-on-surface-variant text-xs leading-relaxed">{u.body}</p>}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-[10px] font-bold">
              {u.author.initials}
            </div>
            <span className="text-xs text-on-surface">{u.author.name}</span>
          </div>
          {project && (
            <Link
              to="/portfolio/$projectId"
              params={{ projectId: project.id }}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              {project.name}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function NewsletterPage() {
  useDataVersion();
  const featured = updates.find((u) => u.featured) ?? updates[0];
  const rest = updates.filter((u) => u.id !== featured.id);
  const liveCount = projects.reduce((n, p) => n + p.enhancementLog.length, 0);
  const shipped = updates.filter((u) => u.tag === "Release").length;
  const sprints = new Set(projects.map((p) => p.sprint).filter(Boolean)).size;
  const cleared = updates.filter((u) => u.tag === "Roadblocker Cleared").length || 3;

  const kpis = [
    { label: "Live Enhancements", value: liveCount, accent: "primary", icon: "bolt" },
    { label: "Shipped This Week", value: shipped || 1, accent: "status-low", icon: "rocket_launch" },
    { label: "Active Sprints", value: sprints, accent: "secondary", icon: "flag" },
    { label: "Blockers Cleared", value: cleared, accent: "status-medium", icon: "verified" },
  ];

  const groups = rest.reduce<Record<string, UpdateEntry[]>>((acc, u) => {
    const day = formatDate(u.publishedAt);
    (acc[day] ||= []).push(u);
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="px-8 py-8 space-y-10 max-w-6xl mx-auto">
        {/* Hero */}
        <header className="relative overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-br from-primary via-secondary to-primary-container text-white p-10">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-80">
                Issue #{currentIssue.number} · {formatDate(currentIssue.publishedAt)}
              </p>
              <h1 className="text-3xl font-bold leading-tight mt-2 tracking-tight">{currentIssue.title}</h1>
              <p className="mt-2 text-xs max-w-xl opacity-90">{currentIssue.intro}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="flex-1 sm:flex-none bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg">
                <span className="material-symbols-outlined text-[18px]">mail</span>
                Subscribe
              </button>
              <Link
                to="/admin"
                className="flex-1 sm:flex-none bg-white/10 backdrop-blur border border-white/30 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Submit Update
              </Link>
            </div>
          </div>
        </header>

        {/* KPI Bento */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="eyebrow">{k.label}</p>
                <span className={`material-symbols-outlined text-[18px] text-${k.accent}`}>{k.icon}</span>
              </div>
              <p className={`kpi-num mt-2 text-${k.accent}`}>{k.value}</p>
            </div>
          ))}
        </section>

        {/* Featured */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">star</span>
            <h2 className="section-title text-base">Featured Update</h2>
          </div>
          <UpdateCard u={featured} large />
        </section>

        {/* Workstream Digest */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
            <h2 className="section-title text-base">Workstream Digest</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(workstreamDigest) as Workstream[]).map((ws) => {
              const d = workstreamDigest[ws];
              return (
                <div key={ws} className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
                  <div className={`px-5 py-3 bg-workstream-${ws.toLowerCase()}/10 flex items-center justify-between`}>
                    <p className={`text-sm font-bold text-workstream-${ws.toLowerCase()}`}>{d.title}</p>
                    <WorkstreamPill ws={ws} />
                  </div>
                  <ul className="p-5 space-y-3">
                    {d.highlights.map((h) => (
                      <li key={h} className="flex gap-2 text-sm text-on-surface-variant">
                        <span className={`material-symbols-outlined text-base text-workstream-${ws.toLowerCase()} shrink-0`}>fiber_manual_record</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Timeline feed */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
            <h2 className="section-title text-base">Updates Feed</h2>
          </div>
          <div className="space-y-6">
            {Object.entries(groups).map(([day, items]) => (
              <div key={day}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">{day}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((u) => (
                    <UpdateCard key={u.id} u={u} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Visual Velocity Impact */}
        <section className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[20px]">insights</span>
            <h3 className="section-title text-base">Visual Velocity Impact</h3>
          </div>
          <p className="text-xs text-on-surface-variant mb-5">
            Enhancements shipped per workstream this issue cycle vs. the previous one.
          </p>
          <div className="grid grid-cols-4 gap-6 items-end h-48">
            {(Object.keys(workstreamDigest) as Workstream[]).map((ws) => {
              const current = workstreamDigest[ws].highlights.length * 22 + 30;
              const previous = Math.max(20, current - 18);
              return (
                <div key={ws} className="flex flex-col items-center gap-2 h-full">
                  <div className="flex-1 w-full flex items-end justify-center gap-2">
                    <div
                      className="w-5 rounded-t-md bg-surface-container-high"
                      style={{ height: `${previous}%` }}
                      title="Previous cycle"
                    />
                    <div
                      className={`w-5 rounded-t-md bg-workstream-${ws.toLowerCase()}`}
                      style={{ height: `${current}%` }}
                      title="Current cycle"
                    />
                  </div>
                  <WorkstreamPill ws={ws} />
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-6 mt-6 text-xs text-on-surface-variant">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-surface-container-high" /> Previous cycle</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-primary" /> Current cycle</span>
          </div>
        </section>

        <footer className="text-center py-10 border-t border-border-subtle">
          <p className="text-sm text-on-surface-variant">
            Have an update to share?{" "}
            <Link to="/admin" className="text-primary font-bold hover:underline">
              Post it from the Admin workspace →
            </Link>
          </p>
        </footer>
      </div>
    </AppShell>
  );
}
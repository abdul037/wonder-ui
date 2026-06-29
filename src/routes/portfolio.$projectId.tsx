import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { getProject, type Project } from "@/data/projects";
import { useState } from "react";

export const Route = createFileRoute("/portfolio/$projectId")({
  loader: ({ params }) => {
    const project = getProject(params.projectId);
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Project"} | PMO Command Center` },
      { name: "description", content: loaderData?.summary ?? "Project detail view." },
      { property: "og:title", content: `${loaderData?.name ?? "Project"} | PMO Command Center` },
      { property: "og:description", content: loaderData?.summary ?? "Project detail view." },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const project = Route.useLoaderData() as Project;
  const [status, setStatus] = useState(project.status);
  const [targetDate, setTargetDate] = useState(project.targetDate);
  const [update, setUpdate] = useState(project.executiveUpdate);
  const [hours, setHours] = useState(project.estimatedHours);

  const circumference = 2 * Math.PI * 58;
  const offset = circumference * (1 - project.progress / 100);
  const ws = project.workstream.toLowerCase();

  return (
    <AppShell>
      <div className="px-8 py-8 max-w-5xl mx-auto">
        <nav className="flex text-xs text-on-surface-variant gap-2 mb-3">
          <Link to="/portfolio" className="hover:text-primary">
            Portfolio
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-bold">{project.name}</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded bg-workstream-${ws}/10 text-workstream-${ws} text-[10px] font-bold uppercase`}>
              Workstream: {project.workstream}
            </span>
            <h2 className="text-2xl font-bold text-on-surface">{project.name}</h2>
          </div>
          <Link to="/portfolio" className="p-2 hover:bg-surface-container-low rounded-full">
            <span className="material-symbols-outlined">close</span>
          </Link>
        </div>

        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Project Progress
              </label>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="58" fill="transparent" stroke="var(--color-surface-container)" strokeWidth="8" />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    fill="transparent"
                    stroke="var(--color-primary)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute text-3xl font-black">{project.progress}%</span>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                  Primary Stakeholder
                </label>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {project.primaryStakeholder.initials}
                  </div>
                  <div>
                    <p className="font-semibold">{project.primaryStakeholder.name}</p>
                    <p className="text-xs text-on-surface-variant">{project.primaryStakeholder.role}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                  Project Owner
                </label>
                <p className="font-semibold">{project.owner}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Project Summary
            </label>
            <p className="text-on-surface leading-relaxed">{project.summary}</p>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-primary uppercase tracking-widest">Current Status Edit</label>
              <span className="material-symbols-outlined text-primary text-sm">edit</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] text-on-surface-variant font-bold uppercase">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option>On Track</option>
                  <option>In Progress</option>
                  <option>Blocked</option>
                  <option>Delayed</option>
                  <option>Completed</option>
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-on-surface-variant font-bold uppercase">Target Date</span>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <span className="text-[11px] text-on-surface-variant font-bold uppercase">Latest Executive Update</span>
                <textarea
                  value={update}
                  onChange={(e) => setUpdate(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-on-surface-variant font-bold uppercase">Estimated Time (Hrs)</span>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Active Blockers ({project.blockers.length})
              </label>
              <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Add Blocker
              </button>
            </div>
            <div className="space-y-2">
              {project.blockers.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic">No active blockers.</p>
              ) : (
                project.blockers.map((b) => (
                  <div key={b.title} className="p-3 bg-status-critical/5 border border-status-critical/20 rounded-lg flex gap-3">
                    <span className="material-symbols-outlined text-status-critical text-lg">warning</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{b.title}</p>
                      <p className="text-xs text-on-surface-variant">{b.detail}</p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-mono mt-1">{b.ago} ago</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Update Timeline
            </label>
            <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border-subtle">
              {project.timeline.map((t, i) => (
                <div key={t.title} className={`relative ${i > 0 && !t.complete ? "opacity-60" : ""}`}>
                  <div className={`absolute -left-[20px] top-1.5 w-2.5 h-2.5 rounded-full border-4 border-surface-card ${t.complete ? "bg-primary" : "bg-outline"}`} />
                  <p className="text-[11px] font-bold text-on-surface-variant mb-1">{t.date}</p>
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.detail && <p className="text-xs text-on-surface-variant">{t.detail}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Stack Inventory
            </label>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((t) => (
                <span key={t} className="px-3 py-1 bg-surface-container rounded-full text-xs font-semibold">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border-subtle">
            <button className="px-6 py-2.5 rounded-lg border border-border-subtle text-on-surface-variant font-bold hover:bg-surface-container-low transition-colors">
              Cancel
            </button>
            <button className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
              Save Changes
            </button>
            <button className="md:col-span-2 px-6 py-2.5 rounded-lg bg-status-critical/10 text-status-critical font-bold hover:bg-status-critical/20 transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">flag</span>
              Escalate to Leadership
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
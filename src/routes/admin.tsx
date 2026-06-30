import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { projects as seedProjects, type Project, type Status, type Workstream, type Priority, type Task } from "@/data/projects";
import { updates as seedUpdates, type UpdateEntry } from "@/data/newsletter";
import {
  pipelineItems as seedPipeline,
  pipelineStages,
  pipelineSources,
  pipelineEfforts,
  pipelineStageColor,
  type PipelineItem,
  type PipelineStage,
  type PipelineSource,
  type PipelineEffort,
} from "@/data/pipeline";
import { relativeTime } from "@/lib/time";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Workspace | Supply Chain Tech Hub" },
      { name: "description", content: "Internal management for projects, tasks, enhancement logs, and newsletter updates." },
    ],
  }),
  component: AdminPage,
});

type TabKey = "projects" | "tasks" | "logs" | "newsletter" | "pipeline";

const tabs: { key: TabKey; label: string; icon: string; desc: string }[] = [
  { key: "projects", label: "Projects", icon: "folder_special", desc: "Manage project info, status, and owners" },
  { key: "tasks", label: "Tasks", icon: "task_alt", desc: "Edit task assignments, sprints, and status" },
  { key: "pipeline", label: "Pipeline", icon: "pending_actions", desc: "Manage intake — promote to active projects" },
  { key: "logs", label: "Enhancement Log", icon: "history_edu", desc: "Append timeline entries per project" },
  { key: "newsletter", label: "Newsletter", icon: "campaign", desc: "Compose and publish product updates" },
];

const statuses: Status[] = ["On Track", "In Progress", "Blocked", "Delayed", "Completed"];
const priorities: Priority[] = ["Critical", "High", "Medium", "Low"];
const workstreams: Workstream[] = ["OX", "EX", "AU", "DW"];

function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-${tone}/10 text-${tone}`}>
      {children}
    </span>
  );
}

function AdminPage() {
  const [tab, setTab] = useState<TabKey>("projects");
  const [allProjects, setAllProjects] = useState<Project[]>(seedProjects);
  const [allUpdates, setAllUpdates] = useState<UpdateEntry[]>(seedUpdates);
  const [allPipeline, setAllPipeline] = useState<PipelineItem[]>(seedPipeline);

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
            <h1 className="text-4xl font-black text-on-surface mt-1">Manage Hub Content</h1>
            <p className="text-on-surface-variant mt-1">
              Update projects, tasks, enhancement logs, and broadcast updates to the SCM newsletter.
            </p>
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
                    active
                      ? "bg-primary-fixed text-on-primary-fixed"
                      : "text-on-surface hover:bg-surface-container-low"
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
            {tab === "projects" && (
              <ProjectsAdmin projects={allProjects} onChange={setAllProjects} />
            )}
            {tab === "tasks" && <TasksAdmin projects={allProjects} onChange={setAllProjects} />}
            {tab === "logs" && <LogsAdmin projects={allProjects} onChange={setAllProjects} />}
            {tab === "newsletter" && (
              <NewsletterAdmin updates={allUpdates} onChange={setAllUpdates} />
            )}
            {tab === "pipeline" && (
              <PipelineAdmin
                items={allPipeline}
                onChange={setAllPipeline}
                onPromote={(item) => {
                  const today = new Date().toISOString().slice(0, 10);
                  const promoted: Project = {
                    id: `p-${Date.now()}`,
                    eid: item.id,
                    name: item.name,
                    taskName: item.name,
                    description: item.description,
                    workstream: item.workstream,
                    type: "Strategic",
                    priority: item.priority,
                    status: "On Track",
                    progress: 0,
                    progressLabel: "Discovery",
                    techStack: [],
                    updatedAgo: "just now",
                    team: [item.techOwner.name, item.businessOwner.name],
                    primaryStakeholder: { name: item.businessOwner.name, role: "Business Owner", initials: item.businessOwner.initials },
                    owner: item.techOwner.name,
                    summary: item.description,
                    targetDate: item.expectedStart,
                    estimatedHours: item.effort === "High" ? 800 : item.effort === "Medium" ? 400 : 160,
                    executiveUpdate: `Newly promoted from pipeline intake ${item.id}. Kickoff scheduled for ${item.expectedStart}.`,
                    techOwner: item.techOwner,
                    businessOwner: item.businessOwner,
                    currentlyWith: item.techOwner,
                    tasks: [],
                    timeline: [{ date: today, title: "Promoted from pipeline", complete: true }],
                    blockers: [],
                    enhancementLog: [
                      { date: today, entry: `Promoted from pipeline intake ${item.id}.` },
                    ],
                    latestUpdate: { text: `Project promoted from pipeline.`, at: new Date().toISOString() },
                  };
                  setAllProjects([promoted, ...allProjects]);
                  setAllPipeline(allPipeline.filter((i) => i.id !== item.id));
                  toast.success(`${item.name} promoted to active project`);
                }}
              />
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

/* -------------------- Projects -------------------- */

function ProjectsAdmin({
  projects,
  onChange,
}: {
  projects: Project[];
  onChange: (next: Project[]) => void;
}) {
  const update = (id: string, patch: Partial<Project>) => {
    onChange(projects.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    toast.success("Project updated");
  };

  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-border-subtle">
        <div>
          <h2 className="text-lg font-bold">All Projects ({projects.length})</h2>
          <p className="text-xs text-on-surface-variant">Inline-edit status, priority, and ownership. Changes persist locally.</p>
        </div>
        <button
          onClick={() => toast.info("New Project dialog — coming with persistence phase")}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Project
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-widest text-on-surface-variant bg-surface-container-low">
              <th className="text-left p-3 font-bold">Project</th>
              <th className="text-left p-3 font-bold">WS</th>
              <th className="text-left p-3 font-bold">Status</th>
              <th className="text-left p-3 font-bold">Priority</th>
              <th className="text-left p-3 font-bold">Tech Owner</th>
              <th className="text-left p-3 font-bold">Business Owner</th>
              <th className="text-left p-3 font-bold">Updated</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-border-subtle hover:bg-surface-container-low">
                <td className="p-3">
                  <p className="font-bold text-on-surface">{p.name}</p>
                  <p className="text-[11px] text-on-surface-variant font-mono">{p.eid}</p>
                </td>
                <td className="p-3"><Pill tone={`workstream-${p.workstream.toLowerCase()}`}>{p.workstream}</Pill></td>
                <td className="p-3">
                  <select
                    value={p.status}
                    onChange={(e) => update(p.id, { status: e.target.value as Status })}
                    className="bg-surface-container-low border border-border-subtle rounded px-2 py-1 text-xs focus:ring-2 focus:ring-primary outline-none"
                  >
                    {statuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <select
                    value={p.priority}
                    onChange={(e) => update(p.id, { priority: e.target.value as Priority })}
                    className="bg-surface-container-low border border-border-subtle rounded px-2 py-1 text-xs focus:ring-2 focus:ring-primary outline-none"
                  >
                    {priorities.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <input
                    defaultValue={p.techOwner.name}
                    onBlur={(e) => update(p.id, { techOwner: { name: e.target.value, initials: e.target.value.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() } })}
                    className="bg-transparent border border-transparent hover:border-border-subtle rounded px-2 py-1 text-xs focus:ring-2 focus:ring-primary outline-none w-full"
                  />
                </td>
                <td className="p-3">
                  <input
                    defaultValue={p.businessOwner.name}
                    onBlur={(e) => update(p.id, { businessOwner: { name: e.target.value, initials: e.target.value.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() } })}
                    className="bg-transparent border border-transparent hover:border-border-subtle rounded px-2 py-1 text-xs focus:ring-2 focus:ring-primary outline-none w-full"
                  />
                </td>
                <td className="p-3 text-xs text-on-surface-variant">{relativeTime(p.latestUpdate.at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------- Tasks -------------------- */

function TasksAdmin({
  projects,
  onChange,
}: {
  projects: Project[];
  onChange: (next: Project[]) => void;
}) {
  const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id ?? "");
  const project = projects.find((p) => p.id === selectedProject);

  const updateTask = (taskId: string, patch: Partial<Task>) => {
    onChange(
      projects.map((p) =>
        p.id === selectedProject ? { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) } : p,
      ),
    );
    toast.success("Task updated");
  };

  const addTask = () => {
    const id = `T-${Math.floor(Math.random() * 9000 + 1000)}`;
    const blank: Task = {
      id,
      name: "New task",
      type: "Enhancement",
      inSprint: false,
      status: "On Track",
      currentlyWith: project!.currentlyWith,
      techOwner: project!.techOwner,
      businessOwner: project!.businessOwner,
      latestUpdate: { text: "Task created", at: new Date().toISOString() },
    };
    onChange(projects.map((p) => (p.id === selectedProject ? { ...p, tasks: [blank, ...p.tasks] } : p)));
    toast.success(`Task ${id} added`);
  };

  const removeTask = (taskId: string) => {
    onChange(projects.map((p) => (p.id === selectedProject ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p)));
    toast.success("Task removed");
  };

  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 flex flex-col md:flex-row md:items-center gap-3 border-b border-border-subtle">
        <div className="flex-1">
          <h2 className="text-lg font-bold">Tasks</h2>
          <p className="text-xs text-on-surface-variant">Pick a project to manage its task backlog.</p>
        </div>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
        >
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button onClick={addTask} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90">
          <span className="material-symbols-outlined text-base">add</span>
          Add Task
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-widest text-on-surface-variant bg-surface-container-low">
              <th className="text-left p-3 font-bold">Task ID</th>
              <th className="text-left p-3 font-bold">Name</th>
              <th className="text-left p-3 font-bold">Type</th>
              <th className="text-left p-3 font-bold">Sprint</th>
              <th className="text-left p-3 font-bold">Status</th>
              <th className="text-left p-3 font-bold">Currently With</th>
              <th className="text-left p-3 font-bold">Updated</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {project?.tasks.map((t) => (
              <tr key={t.id} className="border-t border-border-subtle hover:bg-surface-container-low">
                <td className="p-3 font-mono text-xs text-primary">{t.id}</td>
                <td className="p-3">
                  <input
                    defaultValue={t.name}
                    onBlur={(e) => updateTask(t.id, { name: e.target.value })}
                    className="bg-transparent border border-transparent hover:border-border-subtle rounded px-2 py-1 text-xs focus:ring-2 focus:ring-primary outline-none w-full"
                  />
                </td>
                <td className="p-3"><Pill tone="primary">{t.type}</Pill></td>
                <td className="p-3">
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={t.inSprint}
                      onChange={(e) =>
                        updateTask(t.id, { inSprint: e.target.checked, sprint: e.target.checked ? "Sprint 24" : undefined })
                      }
                    />
                    {t.inSprint ? t.sprint ?? "In sprint" : "Backlog"}
                  </label>
                </td>
                <td className="p-3">
                  <select
                    value={t.status}
                    onChange={(e) => updateTask(t.id, { status: e.target.value as Status })}
                    className="bg-surface-container-low border border-border-subtle rounded px-2 py-1 text-xs"
                  >
                    {statuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <input
                    defaultValue={t.currentlyWith.name}
                    onBlur={(e) =>
                      updateTask(t.id, {
                        currentlyWith: { name: e.target.value, initials: e.target.value.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() },
                      })
                    }
                    className="bg-transparent border border-transparent hover:border-border-subtle rounded px-2 py-1 text-xs focus:ring-2 focus:ring-primary outline-none w-full"
                  />
                </td>
                <td className="p-3 text-xs text-on-surface-variant">{relativeTime(t.latestUpdate.at)}</td>
                <td className="p-3">
                  <button onClick={() => removeTask(t.id)} className="text-status-critical hover:bg-status-critical/10 rounded p-1">
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------- Enhancement Log -------------------- */

function LogsAdmin({
  projects,
  onChange,
}: {
  projects: Project[];
  onChange: (next: Project[]) => void;
}) {
  const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id ?? "");
  const [entry, setEntry] = useState("");
  const project = projects.find((p) => p.id === selectedProject);

  const addEntry = () => {
    if (!entry.trim()) return;
    onChange(
      projects.map((p) =>
        p.id === selectedProject
          ? { ...p, enhancementLog: [{ date: new Date().toISOString().slice(0, 10), entry: entry.trim() }, ...p.enhancementLog] }
          : p,
      ),
    );
    setEntry("");
    toast.success("Log entry added");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <div className="bg-surface-card border border-border-subtle rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 flex items-center gap-3 border-b border-border-subtle">
          <div className="flex-1">
            <h2 className="text-lg font-bold">Enhancement Log</h2>
            <p className="text-xs text-on-surface-variant">Chronological notes per project — shown on the detail page.</p>
          </div>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-sm"
          >
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <ol className="p-5 space-y-4 relative">
          {project?.enhancementLog.map((l, i) => (
            <li key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                {i < project.enhancementLog.length - 1 && <div className="w-px flex-1 bg-border-subtle" />}
              </div>
              <div className="flex-1 pb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{l.date}</p>
                <p className="text-sm text-on-surface mt-1">{l.entry}</p>
              </div>
            </li>
          ))}
          {!project?.enhancementLog.length && (
            <p className="text-sm text-on-surface-variant">No log entries yet.</p>
          )}
        </ol>
      </div>
      <aside className="bg-surface-card border border-border-subtle rounded-xl shadow-sm p-5 h-fit space-y-3">
        <h3 className="font-bold">Add Log Entry</h3>
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="e.g. UAT round 4 kicked off across 14 DCs"
          className="w-full min-h-[120px] bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
        />
        <button onClick={addEntry} className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:opacity-90">
          Append to Log
        </button>
      </aside>
    </div>
  );
}

/* -------------------- Pipeline -------------------- */

function PipelineAdmin({
  items,
  onChange,
  onPromote,
}: {
  items: PipelineItem[];
  onChange: (next: PipelineItem[]) => void;
  onPromote: (item: PipelineItem) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    workstream: "OX" as Workstream,
    priority: "Medium" as Priority,
    effort: "Medium" as PipelineEffort,
    source: "Business Request" as PipelineSource,
    stage: "Idea" as PipelineStage,
    expectedStart: new Date().toISOString().slice(0, 10),
    businessOwner: "",
    techOwner: "",
  });

  const update = (id: string, patch: Partial<PipelineItem>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    toast.success("Intake updated");
  };

  const remove = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
    toast.success("Intake removed");
  };

  const create = () => {
    if (!form.name.trim() || !form.businessOwner.trim() || !form.techOwner.trim()) {
      toast.error("Name, business owner and tech owner are required");
      return;
    }
    const item: PipelineItem = {
      id: `PL-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: form.name,
      description: form.description || form.name,
      workstream: form.workstream,
      priority: form.priority,
      effort: form.effort,
      source: form.source,
      stage: form.stage,
      expectedStart: form.expectedStart,
      businessOwner: {
        name: form.businessOwner,
        initials: form.businessOwner.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase(),
      },
      techOwner: {
        name: form.techOwner,
        initials: form.techOwner.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase(),
      },
      createdAt: new Date().toISOString().slice(0, 10),
    };
    onChange([item, ...items]);
    setForm({ ...form, name: "", description: "", businessOwner: "", techOwner: "" });
    toast.success(`${item.id} added to pipeline`);
  };

  const inputCls =
    "w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <div className="bg-surface-card border border-border-subtle rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border-subtle">
          <h2 className="text-lg font-bold">Pipeline Intake ({items.length})</h2>
          <p className="text-xs text-on-surface-variant">
            Triage demand — edit stage / priority inline, promote approved items into active projects.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-on-surface-variant bg-surface-container-low">
                <th className="text-left p-3 font-bold">Intake</th>
                <th className="text-left p-3 font-bold">WS</th>
                <th className="text-left p-3 font-bold">Stage</th>
                <th className="text-left p-3 font-bold">Priority</th>
                <th className="text-left p-3 font-bold">Effort</th>
                <th className="text-left p-3 font-bold">Expected</th>
                <th className="text-left p-3 font-bold">Owners</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-t border-border-subtle hover:bg-surface-container-low align-top">
                  <td className="p-3">
                    <p className="font-bold text-on-surface">{i.name}</p>
                    <p className="text-[11px] text-on-surface-variant font-mono">{i.id} · {i.source}</p>
                  </td>
                  <td className="p-3">
                    <select
                      value={i.workstream}
                      onChange={(e) => update(i.id, { workstream: e.target.value as Workstream })}
                      className="bg-surface-container-low border border-border-subtle rounded px-2 py-1 text-xs"
                    >
                      {workstreams.map((w) => <option key={w}>{w}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={i.stage}
                      onChange={(e) => update(i.id, { stage: e.target.value as PipelineStage })}
                      className={`border border-border-subtle rounded px-2 py-1 text-xs bg-${pipelineStageColor[i.stage]}/10 text-${pipelineStageColor[i.stage]} font-bold`}
                    >
                      {pipelineStages.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={i.priority}
                      onChange={(e) => update(i.id, { priority: e.target.value as Priority })}
                      className="bg-surface-container-low border border-border-subtle rounded px-2 py-1 text-xs"
                    >
                      {priorities.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={i.effort}
                      onChange={(e) => update(i.id, { effort: e.target.value as PipelineEffort })}
                      className="bg-surface-container-low border border-border-subtle rounded px-2 py-1 text-xs"
                    >
                      {pipelineEfforts.map((e) => <option key={e}>{e}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <input
                      type="date"
                      defaultValue={i.expectedStart}
                      onBlur={(e) => update(i.id, { expectedStart: e.target.value })}
                      className="bg-surface-container-low border border-border-subtle rounded px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="p-3 text-xs text-on-surface-variant">
                    <div>B · {i.businessOwner.name}</div>
                    <div>T · {i.techOwner.name}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onPromote(i)}
                        title="Promote to active project"
                        className="text-primary hover:bg-primary/10 rounded p-1"
                      >
                        <span className="material-symbols-outlined text-base">north_east</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete intake ${i.id}?`)) remove(i.id);
                        }}
                        className="text-status-critical hover:bg-status-critical/10 rounded p-1"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-on-surface-variant">
                    No pipeline items yet — use the form to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="bg-surface-card border border-border-subtle rounded-xl shadow-sm p-5 space-y-3 h-fit lg:sticky lg:top-20">
        <h3 className="font-bold">Add Intake</h3>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputCls}
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${inputCls} min-h-[80px]`}
        />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.workstream} onChange={(e) => setForm({ ...form, workstream: e.target.value as Workstream })} className={inputCls}>
            {workstreams.map((w) => <option key={w}>{w}</option>)}
          </select>
          <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as PipelineStage })} className={inputCls}>
            {pipelineStages.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className={inputCls}>
            {priorities.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select value={form.effort} onChange={(e) => setForm({ ...form, effort: e.target.value as PipelineEffort })} className={inputCls}>
            {pipelineEfforts.map((e) => <option key={e}>{e}</option>)}
          </select>
          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as PipelineSource })} className={`${inputCls} col-span-2`}>
            {pipelineSources.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <input
          type="date"
          value={form.expectedStart}
          onChange={(e) => setForm({ ...form, expectedStart: e.target.value })}
          className={inputCls}
        />
        <input
          placeholder="Business owner"
          value={form.businessOwner}
          onChange={(e) => setForm({ ...form, businessOwner: e.target.value })}
          className={inputCls}
        />
        <input
          placeholder="Tech owner"
          value={form.techOwner}
          onChange={(e) => setForm({ ...form, techOwner: e.target.value })}
          className={inputCls}
        />
        <button onClick={create} className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:opacity-90 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base">add</span>
          Add to Pipeline
        </button>
      </aside>
    </div>
  );
}

/* -------------------- Newsletter -------------------- */

function NewsletterAdmin({
  updates,
  onChange,
}: {
  updates: UpdateEntry[];
  onChange: (next: UpdateEntry[]) => void;
}) {
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
    onChange([u, ...updates]);
    setForm({ ...form, title: "", summary: "", body: "" });
    toast.success("Update published to newsletter");
  };

  const remove = (id: string) => {
    onChange(updates.filter((u) => u.id !== id));
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
        </ul>
      </div>

      <aside className="bg-surface-card border border-border-subtle rounded-xl shadow-sm p-5 space-y-3 h-fit lg:sticky lg:top-20">
        <h3 className="font-bold">Compose Update</h3>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputCls}
        />
        <textarea
          placeholder="Summary (1–2 lines)"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          className={`${inputCls} min-h-[60px]`}
        />
        <textarea
          placeholder="Body (optional, shown on featured)"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          className={`${inputCls} min-h-[100px]`}
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={form.workstream}
            onChange={(e) => setForm({ ...form, workstream: e.target.value as Workstream })}
            className={inputCls}
          >
            {workstreams.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <select
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value as UpdateEntry["tag"] })}
            className={inputCls}
          >
            {(["Enhancement", "Release", "Heads Up", "Roadblocker Cleared"] as const).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <input
          placeholder="Author"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          className={inputCls}
        />
        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Feature this update at the top
        </label>
        <button onClick={publish} className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:opacity-90 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base">send</span>
          Publish to Newsletter
        </button>
      </aside>
    </div>
  );
}
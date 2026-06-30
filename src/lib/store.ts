import { useSyncExternalStore } from "react";
import { projects, type Person, type Priority, type Project, type Status, type Task, type Workstream } from "@/data/projects";
import { pipelineItems, type PipelineEffort, type PipelineItem, type PipelineSource, type PipelineStage } from "@/data/pipeline";
import { updates, type UpdateEntry } from "@/data/newsletter";

const listeners = new Set<() => void>();
let version = 0;

function bump() {
  version++;
  listeners.forEach((l) => l());
}

/** Subscribe to in-place mutations across projects / pipeline / newsletter. */
export function useDataVersion(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
    () => 0,
  );
}

function toPerson(name: string): Person {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "—";
  return { name, initials };
}

/* ---------------- Projects ---------------- */

export interface ProjectDraft {
  name: string;
  workstream: Workstream;
  status: Status;
  priority: Priority;
  techOwnerName: string;
  businessOwnerName: string;
  currentlyWithName: string;
  latestUpdateText: string;
}

export function projectToDraft(p: Project): ProjectDraft {
  return {
    name: p.name,
    workstream: p.workstream,
    status: p.status,
    priority: p.priority,
    techOwnerName: p.techOwner.name,
    businessOwnerName: p.businessOwner.name,
    currentlyWithName: p.currentlyWith.name,
    latestUpdateText: p.latestUpdate.text,
  };
}

export function applyProjectDraft(id: string, d: ProjectDraft) {
  const i = projects.findIndex((p) => p.id === id);
  if (i < 0) return;
  const p = projects[i];
  p.name = d.name.trim() || p.name;
  p.workstream = d.workstream;
  p.status = d.status;
  p.priority = d.priority;
  p.techOwner = toPerson(d.techOwnerName);
  p.businessOwner = toPerson(d.businessOwnerName);
  p.currentlyWith = toPerson(d.currentlyWithName);
  if (d.latestUpdateText && d.latestUpdateText !== p.latestUpdate.text) {
    p.latestUpdate = { text: d.latestUpdateText, at: new Date().toISOString() };
  }
  bump();
}

export function deleteProject(id: string) {
  const i = projects.findIndex((p) => p.id === id);
  if (i < 0) return;
  projects.splice(i, 1);
  bump();
}

export function createProject(d: ProjectDraft) {
  const id = `p-${Date.now()}`;
  const tech = toPerson(d.techOwnerName || "TBD");
  const biz = toPerson(d.businessOwnerName || "TBD");
  const cur = toPerson(d.currentlyWithName || tech.name);
  const today = new Date().toISOString().slice(0, 10);
  const proj: Project = {
    id,
    name: d.name.trim() || "New Project",
    taskName: d.name.trim() || "New Project",
    workstream: d.workstream,
    type: "Strategic",
    priority: d.priority,
    eid: id.toUpperCase(),
    status: d.status,
    techStack: [],
    updatedAgo: "just now",
    description: d.latestUpdateText || "Newly created project.",
    progress: 0,
    progressLabel: "Discovery",
    team: [tech.name, biz.name],
    primaryStakeholder: { name: biz.name, role: "Business Owner", initials: biz.initials },
    owner: tech.name,
    summary: d.latestUpdateText || "Newly created project.",
    targetDate: today,
    estimatedHours: 0,
    executiveUpdate: "Created via Admin Mode.",
    blockers: [],
    timeline: [{ date: today, title: "Project created", complete: true }],
    techOwner: tech,
    businessOwner: biz,
    currentlyWith: cur,
    enhancementLog: [{ date: today, entry: "Project created via Admin Mode." }],
    latestUpdate: { text: d.latestUpdateText || "Project created.", at: new Date().toISOString() },
    tasks: [],
  };
  projects.unshift(proj);
  bump();
  return proj;
}

/* ---------------- Tasks ---------------- */

export interface TaskDraft {
  name: string;
  status: Status;
  inSprint: boolean;
  sprint?: string;
  currentlyWithName: string;
  techOwnerName: string;
  businessOwnerName: string;
  latestUpdateText: string;
}

export function applyTaskDraft(projectId: string, taskId: string, d: TaskDraft) {
  const p = projects.find((pp) => pp.id === projectId);
  if (!p) return;
  const t = p.tasks.find((tt) => tt.id === taskId);
  if (!t) return;
  t.name = d.name.trim() || t.name;
  t.status = d.status;
  t.inSprint = d.inSprint;
  t.sprint = d.inSprint ? d.sprint || t.sprint || "Current Sprint" : undefined;
  t.currentlyWith = toPerson(d.currentlyWithName);
  t.techOwner = toPerson(d.techOwnerName);
  t.businessOwner = toPerson(d.businessOwnerName);
  if (d.latestUpdateText && d.latestUpdateText !== t.latestUpdate.text) {
    t.latestUpdate = { text: d.latestUpdateText, at: new Date().toISOString() };
  }
  bump();
}

export function deleteTask(projectId: string, taskId: string) {
  const p = projects.find((pp) => pp.id === projectId);
  if (!p) return;
  const i = p.tasks.findIndex((t) => t.id === taskId);
  if (i < 0) return;
  p.tasks.splice(i, 1);
  bump();
}

export function createTask(projectId: string, d: Partial<TaskDraft> = {}): Task | null {
  const p = projects.find((pp) => pp.id === projectId);
  if (!p) return null;
  const id = `T-${Math.floor(Math.random() * 9000 + 1000)}`;
  const task: Task = {
    id,
    name: d.name?.trim() || "New task",
    type: "Enhancement",
    inSprint: !!d.inSprint,
    sprint: d.inSprint ? d.sprint || "Current Sprint" : undefined,
    status: d.status ?? "On Track",
    currentlyWith: d.currentlyWithName ? toPerson(d.currentlyWithName) : p.currentlyWith,
    techOwner: d.techOwnerName ? toPerson(d.techOwnerName) : p.techOwner,
    businessOwner: d.businessOwnerName ? toPerson(d.businessOwnerName) : p.businessOwner,
    latestUpdate: { text: d.latestUpdateText || "Task created", at: new Date().toISOString() },
  };
  p.tasks.unshift(task);
  bump();
  return task;
}

/* ---------------- Pipeline ---------------- */

export interface PipelineDraft {
  name: string;
  description: string;
  workstream: Workstream;
  stage: PipelineStage;
  priority: Priority;
  effort: PipelineEffort;
  source: PipelineSource;
  expectedStart: string;
  businessOwnerName: string;
  techOwnerName: string;
}

export function pipelineToDraft(p: PipelineItem): PipelineDraft {
  return {
    name: p.name,
    description: p.description,
    workstream: p.workstream,
    stage: p.stage,
    priority: p.priority,
    effort: p.effort,
    source: p.source,
    expectedStart: p.expectedStart,
    businessOwnerName: p.businessOwner.name,
    techOwnerName: p.techOwner.name,
  };
}

export function applyPipelineDraft(id: string, d: PipelineDraft) {
  const i = pipelineItems.findIndex((p) => p.id === id);
  if (i < 0) return;
  const p = pipelineItems[i];
  p.name = d.name.trim() || p.name;
  p.description = d.description;
  p.workstream = d.workstream;
  p.stage = d.stage;
  p.priority = d.priority;
  p.effort = d.effort;
  p.source = d.source;
  p.expectedStart = d.expectedStart;
  p.businessOwner = toPerson(d.businessOwnerName);
  p.techOwner = toPerson(d.techOwnerName);
  bump();
}

export function createPipeline(d: PipelineDraft): PipelineItem {
  const id = `PL-${Math.floor(Math.random() * 9000 + 1000)}`;
  const item: PipelineItem = {
    id,
    name: d.name.trim() || "New intake",
    description: d.description || d.name || "",
    workstream: d.workstream,
    stage: d.stage,
    priority: d.priority,
    effort: d.effort,
    source: d.source,
    expectedStart: d.expectedStart,
    businessOwner: toPerson(d.businessOwnerName || "TBD"),
    techOwner: toPerson(d.techOwnerName || "TBD"),
    createdAt: new Date().toISOString().slice(0, 10),
  };
  pipelineItems.unshift(item);
  bump();
  return item;
}

export function deletePipeline(id: string) {
  const i = pipelineItems.findIndex((p) => p.id === id);
  if (i < 0) return;
  pipelineItems.splice(i, 1);
  bump();
}

export function promotePipeline(id: string): Project | null {
  const i = pipelineItems.findIndex((p) => p.id === id);
  if (i < 0) return null;
  const item = pipelineItems[i];
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
    executiveUpdate: `Newly promoted from pipeline intake ${item.id}.`,
    techOwner: item.techOwner,
    businessOwner: item.businessOwner,
    currentlyWith: item.techOwner,
    tasks: [],
    timeline: [{ date: today, title: "Promoted from pipeline", complete: true }],
    blockers: [],
    enhancementLog: [{ date: today, entry: `Promoted from pipeline intake ${item.id}.` }],
    latestUpdate: { text: "Project promoted from pipeline.", at: new Date().toISOString() },
  };
  projects.unshift(promoted);
  pipelineItems.splice(i, 1);
  bump();
  return promoted;
}

/* ---------------- Newsletter ---------------- */

export function addUpdate(u: UpdateEntry) {
  updates.unshift(u);
  bump();
}

export function deleteUpdate(id: string) {
  const i = updates.findIndex((u) => u.id === id);
  if (i < 0) return;
  updates.splice(i, 1);
  bump();
}
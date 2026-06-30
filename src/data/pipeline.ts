import type { Person, Workstream, Priority } from "./projects";

export type PipelineStage = "Idea" | "Under Review" | "Approved" | "Scheduled";
export type PipelineSource = "Business Request" | "Internal Idea" | "Mandate";
export type PipelineEffort = "Low" | "Medium" | "High";

export interface PipelineItem {
  id: string;
  name: string;
  workstream: Workstream;
  expectedStart: string; // ISO date
  businessOwner: Person;
  techOwner: Person;
  priority: Priority;
  effort: PipelineEffort;
  description: string;
  source: PipelineSource;
  stage: PipelineStage;
  createdAt: string;
}

export const pipelineStages: PipelineStage[] = ["Idea", "Under Review", "Approved", "Scheduled"];
export const pipelineSources: PipelineSource[] = ["Business Request", "Internal Idea", "Mandate"];
export const pipelineEfforts: PipelineEffort[] = ["Low", "Medium", "High"];

export const pipelineStageColor: Record<PipelineStage, string> = {
  Idea: "status-low",
  "Under Review": "status-medium",
  Approved: "primary",
  Scheduled: "workstream-au",
};

export const pipelineItems: PipelineItem[] = [
  {
    id: "PL-2401",
    name: "Cross-Dock Yard Camera AI",
    workstream: "OX",
    expectedStart: "2026-08-15",
    businessOwner: { name: "Layla Hassan", initials: "LH" },
    techOwner: { name: "Daniel Wu", initials: "DW" },
    priority: "High",
    effort: "High",
    description: "Computer-vision pilot at Jubail yard to auto-detect trailer dwell and missed appointments.",
    source: "Business Request",
    stage: "Under Review",
    createdAt: "2026-06-14",
  },
  {
    id: "PL-2402",
    name: "Driver Mobile Companion v2",
    workstream: "EX",
    expectedStart: "2026-07-28",
    businessOwner: { name: "Aisha Rahman", initials: "AR" },
    techOwner: { name: "Marcus Sterling", initials: "MS" },
    priority: "Critical",
    effort: "Medium",
    description: "Offline-first re-write of the driver app — proof-of-delivery photos, route geofence alerts, Arabic UI.",
    source: "Mandate",
    stage: "Approved",
    createdAt: "2026-05-30",
  },
  {
    id: "PL-2403",
    name: "Tank Asset Utilization Dashboard",
    workstream: "AU",
    expectedStart: "2026-09-01",
    businessOwner: { name: "Khalid Otaibi", initials: "KO" },
    techOwner: { name: "Priya Menon", initials: "PM" },
    priority: "Medium",
    effort: "Low",
    description: "Live utilization heatmap of cryogenic tanks across MENA hubs, with idle-time alerts to ops.",
    source: "Internal Idea",
    stage: "Idea",
    createdAt: "2026-06-22",
  },
  {
    id: "PL-2404",
    name: "PowerBI Cost-to-Serve Refactor",
    workstream: "DW",
    expectedStart: "2026-07-10",
    businessOwner: { name: "Noor Saleh", initials: "NS" },
    techOwner: { name: "Vikram Iyer", initials: "VI" },
    priority: "High",
    effort: "Medium",
    description: "Migrate legacy Excel-based cost-to-serve model into a governed PowerBI semantic layer.",
    source: "Business Request",
    stage: "Scheduled",
    createdAt: "2026-05-12",
  },
  {
    id: "PL-2405",
    name: "Warehouse Voice-Pick Trial",
    workstream: "OX",
    expectedStart: "2026-10-05",
    businessOwner: { name: "Tariq Ahmed", initials: "TA" },
    techOwner: { name: "Sara Voss", initials: "SV" },
    priority: "Medium",
    effort: "High",
    description: "8-week voice-directed pick trial in Dammam DC to benchmark throughput vs. handheld scanners.",
    source: "Internal Idea",
    stage: "Idea",
    createdAt: "2026-06-28",
  },
  {
    id: "PL-2406",
    name: "Employee Shift-Swap Portal",
    workstream: "EX",
    expectedStart: "2026-08-30",
    businessOwner: { name: "Mei Tanaka", initials: "MT" },
    techOwner: { name: "Ravi Shankar", initials: "RS" },
    priority: "Low",
    effort: "Low",
    description: "Self-service portal for operators to swap shifts within compliance windows.",
    source: "Business Request",
    stage: "Under Review",
    createdAt: "2026-06-08",
  },
  {
    id: "PL-2407",
    name: "Fleet Telematics Data Lake",
    workstream: "DW",
    expectedStart: "2026-09-20",
    businessOwner: { name: "Omar Faisal", initials: "OF" },
    techOwner: { name: "Helena Schmidt", initials: "HS" },
    priority: "High",
    effort: "High",
    description: "Unify telematics streams from 3 vendors into a governed lake for fuel & route analytics.",
    source: "Mandate",
    stage: "Approved",
    createdAt: "2026-05-22",
  },
  {
    id: "PL-2408",
    name: "Asset Tagging RFID Rollout",
    workstream: "AU",
    expectedStart: "2026-11-15",
    businessOwner: { name: "Yasmin El-Sayed", initials: "YE" },
    techOwner: { name: "Liam O'Connor", initials: "LO" },
    priority: "Medium",
    effort: "Medium",
    description: "Phased RFID tagging across 12,000 cylinders to enable real-time location tracking.",
    source: "Internal Idea",
    stage: "Scheduled",
    createdAt: "2026-06-01",
  },
];
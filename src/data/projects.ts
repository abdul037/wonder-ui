export type Workstream = "OX" | "EX" | "AU" | "DW";
export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Status = "On Track" | "In Progress" | "Blocked" | "Delayed" | "Completed";
export type TaskType = "Enhancement" | "Bug" | "Discovery" | "Integration" | "Strategic" | "Issue";

export interface Person {
  name: string;
  initials: string;
}

export interface UpdateEntry {
  text: string;
  at: string; // ISO timestamp
}

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  inSprint: boolean;
  sprint?: string;
  status: Status;
  currentlyWith: Person;
  techOwner: Person;
  businessOwner: Person;
  latestUpdate: UpdateEntry;
}

export interface Project {
  id: string;
  name: string;
  taskName: string;
  workstream: Workstream;
  type: string;
  priority: Priority;
  eid: string;
  status: Status;
  blocker?: string;
  techStack: string[];
  updatedAgo: string;
  description: string;
  progress: number;
  progressLabel: string;
  sprint?: string;
  team: string[];
  primaryStakeholder: { name: string; role: string; initials: string };
  owner: string;
  summary: string;
  targetDate: string;
  estimatedHours: number;
  executiveUpdate: string;
  blockers: { title: string; detail: string; ago: string }[];
  timeline: { date: string; title: string; detail?: string; complete?: boolean }[];
  // SCM Central — phase 1 additions
  techOwner: Person;
  businessOwner: Person;
  currentlyWith: Person;
  enhancementLog: { date: string; entry: string }[];
  latestUpdate: UpdateEntry;
  tasks: Task[];
}

const avatars = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBxAT2anZ4lOdDrtqaZOWWtnjNoWhL8Nga6BfJV5nU-WOnDsEqYrEE8WcZPSH-Zgg5eqxBTz-WiCuMH5e0VzGzw2G374jgORJ8gVS-ccuWLpN368oPAI9YDbV7G1LjpE_kLmJjZvl0XdxeGfZchCx2h14VmGJlXFra9aj_6Eb3h1yitRtpK0QLy9pelLIBo_xenkRzylgf8UoTEE6fdN7LqlceoQt8pFGFoaiuUVe_y9y6toInDLeqemxruo9ZrfS_UpFRCZsNYtKrV",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDLyvotekRJZkt4AuOzvzDvL1QzPRx7htEQZeVA4YZEX_c7JD4XX03aiboBVxfFA4qndNoqP_a31TqrtJXCOppSvi1zv9fxPfz6XNvTTHH_lz0yVDzEIwu0BDCAxLmB7-7ncPQGqX_JFjYoJhfNuQid0m54nL2c-YTrDeBnPaA0kBmlgVSr7XCQWG8JsVeZvAW3mVgzTkjFEfXL3ldNGgztvVugDD93oCW-hoCyzdr8NUw5vOH5p1O_Ku57SUghC-TLoAHtjsMr5w-y",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCjWqoTGvbKAWMkgYKSOj6ajTx-E-gE6n_T5fyje65s9T7F0d0QtiOBxRgUq5U-6HQysCly30bRavOY7mQm2fYMfJll7l2q_gbG11Ym5QTiTRJkXuWOPEN9zNULnHuF1wlKLtt4e4zQgRgJ5jJ6feICgyhPOW0uiFEPdAGSZYWYuMhTXeUlpFR6QNzJtmXGp-tHy2MMzayXPJB3efqDNn6yIPWygQWo2PWhXHOS0B6n6I5zKx3i5-LiQ57iDujDfedFSK_1pAxSiHF1",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDgTcUhDJ7cZ7ftcvonJFStB5z7OOKwMILR7AkvyXTdcrS02RrkmfOlKhR_P-jaM58IzOW9t3TEDAOGi9MKFxTq_ho0YRkzc1dgrcb3TBV4_D5bcg2S7FdRy1Q3aybeLikyfNv9p1g6AAx37--HAkYT2VVtnEGsSlG-tUCSY6r0Vx0WTMQCvGg2uQAyuazx1OvrTqqawCFuNNcGFsbOVnJBJ0dHglNPhxNRHkUOxpAJpncb8Y1MIrNS2ywOdEoK6qo8cISwA89dOh02",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA31jLBDsyBmkwvlb6i1BojUBtY7ANN8jTf3Q_ZZrEBiPQ1WO_g6xKdaYAVjXftC7Ha6ukhUGe3PmPWamNpxtyUd8NwU876zn23ID0335k1uXLiv254XeVMc7uQXAgQrbTf93sfOsj7NrCKCGld2BzVkOjCaa-9bP65TMh8mPIXLjodZGr6bAQ6EmTz9etluht4OtR_7XsIt1RHmIDO5uxFZg6PgXjcx8sUOXHATWEIL0hhaXrU44sU6kHPqoUe_38E-TEGhE6fWSkU",
];

export const projects: Project[] = [
  {
    id: "fero-auto-plan",
    name: "Fero Auto-Plan Enhancement",
    taskName: "API Integration Layer",
    workstream: "OX",
    type: "Enhancement",
    priority: "High",
    eid: "E-4902",
    status: "Blocked",
    blocker: "Waiting for API",
    techStack: ["Node.js", "AWS"],
    updatedAgo: "2h ago",
    description: "Optimization of routing algorithms for mid-mile logistics efficiency.",
    progress: 65,
    progressLabel: "Development Progress",
    sprint: "Sprint 24",
    team: avatars.slice(0, 2),
    primaryStakeholder: { name: "Jonathan Davis", role: "VP of Engineering", initials: "JD" },
    owner: "Sarah Jenkins",
    summary:
      "Mid-mile logistics routing layer is being re-architected to ingest live telemetry from vendor APIs. Phase 2 of 4 is in progress, blocked on third-party OAuth credentials from Fero Global Systems.",
    targetDate: "2026-09-30",
    estimatedHours: 1420,
    executiveUpdate:
      "Infrastructure networking layer established. Beginning container orchestration migration for microservices next week.",
    blockers: [
      { title: "API Credentials Pending", detail: "Vendor: Fero Global Systems. 24h delay impact.", ago: "4d" },
    ],
    timeline: [
      { date: "OCT 24", title: "Infrastructure Baseline Approved", detail: "Validated by Architecture Review Board.", complete: true },
      { date: "OCT 18", title: "Initial Scoping Complete", complete: true },
    ],
  },
  {
    id: "bulk-weighscale",
    name: "Bulk WeighScale Integration",
    taskName: "UAT Testing Round 3",
    workstream: "DW",
    type: "Integration",
    priority: "Medium",
    eid: "E-4811",
    status: "In Progress",
    techStack: ["Python", "SQL"],
    updatedAgo: "5h ago",
    description: "Direct API piping from warehouse weigh-stations to centralized ERP.",
    progress: 88,
    progressLabel: "UAT Testing",
    sprint: "Sprint 24",
    team: [avatars[2]],
    primaryStakeholder: { name: "Priya Raman", role: "Director, Data Platform", initials: "PR" },
    owner: "Marcus Vega",
    summary:
      "Streaming scale readings from 14 distribution centers directly into the centralized ERP. UAT is in its final round with 3 days remaining before cutover.",
    targetDate: "2026-07-12",
    estimatedHours: 860,
    executiveUpdate: "All four pilot DCs are passing reconciliation. Cutover plan submitted for change board.",
    blockers: [],
    timeline: [
      { date: "JUN 20", title: "UAT Round 3 kicked off", complete: true },
      { date: "JUN 02", title: "Pilot expansion to 4 DCs", complete: true },
    ],
  },
  {
    id: "driver-app-ocr",
    name: "Driver App OCR",
    taskName: "Discovery Phase",
    workstream: "AU",
    type: "Discovery",
    priority: "Low",
    eid: "E-4955",
    status: "On Track",
    techStack: ["Swift", "TensorFlow"],
    updatedAgo: "1d ago",
    description: "Implementing optical character recognition for document scanning.",
    progress: 15,
    progressLabel: "Discovery Phase",
    sprint: "Sprint 25",
    team: avatars.slice(3, 5),
    primaryStakeholder: { name: "Lena Ortiz", role: "Head of Driver Experience", initials: "LO" },
    owner: "Devon Park",
    summary: "Exploratory work on capturing proof-of-delivery slips inside the driver mobile app via on-device OCR.",
    targetDate: "2026-11-04",
    estimatedHours: 320,
    executiveUpdate: "Vendor benchmark underway across three OCR libraries; results expected next sprint.",
    blockers: [],
    timeline: [{ date: "JUN 24", title: "Discovery kickoff", complete: true }],
  },
  {
    id: "data-stream-2",
    name: "Data Stream 2.0",
    taskName: "Validation Schema Update",
    workstream: "DW",
    type: "Issue",
    priority: "Medium",
    eid: "I-1233",
    status: "In Progress",
    techStack: ["Python", "SQL"],
    updatedAgo: "5h ago",
    description: "Refactor of the realtime validation schema for downstream consumers.",
    progress: 42,
    progressLabel: "Implementation",
    sprint: "Sprint 24",
    team: [avatars[0]],
    primaryStakeholder: { name: "Eli Chen", role: "Principal Data Engineer", initials: "EC" },
    owner: "Hana Patel",
    summary: "Versioned schema rollout to enable additive changes without breaking downstream consumers.",
    targetDate: "2026-08-08",
    estimatedHours: 280,
    executiveUpdate: "Schema registry deployed to staging; canary consumers validating in parallel.",
    blockers: [],
    timeline: [{ date: "JUN 18", title: "Registry live in staging", complete: true }],
  },
  {
    id: "experience-portal",
    name: "Experience Portal",
    taskName: "User Profile Redesign",
    workstream: "EX",
    type: "Enhancement",
    priority: "Low",
    eid: "E-4955",
    status: "Delayed",
    blocker: "Design Feedback",
    techStack: ["Figma", "React"],
    updatedAgo: "1d ago",
    description: "Refresh of the executive stakeholder portal user profile area.",
    progress: 30,
    progressLabel: "Design",
    sprint: "Sprint 25",
    team: avatars.slice(0, 2),
    primaryStakeholder: { name: "Mark Stein", role: "Creative Director", initials: "MS" },
    owner: "Mark Stein",
    summary: "Holistic refresh of the profile area, blocked on stakeholder review delayed by the quarterly offsite.",
    targetDate: "2026-10-01",
    estimatedHours: 240,
    executiveUpdate: "Awaiting design feedback from leadership review; milestone at risk.",
    blockers: [
      { title: "Pending Design Approval", detail: "Stakeholder review delayed due to internal quarterly offsite.", ago: "3d" },
    ],
    timeline: [{ date: "JUN 12", title: "Hi-fi mocks delivered", complete: true }],
  },
  {
    id: "global-expansion",
    name: "Global Expansion Roadmap 2025",
    taskName: "Phase 4: Entity Registration",
    workstream: "EX",
    type: "Strategic",
    priority: "Critical",
    eid: "S-0014",
    status: "In Progress",
    techStack: ["Confluence", "Jira"],
    updatedAgo: "3h ago",
    description: "Consolidated strategic plan for Southeast Asian market penetration.",
    progress: 33,
    progressLabel: "Phases (4/12)",
    sprint: "Sprint 24",
    team: avatars.slice(0, 3),
    primaryStakeholder: { name: "Marcus Sterling", role: "Chief Project Officer", initials: "MS" },
    owner: "Anika Rao",
    summary: "Cross-functional strategic plan for Southeast Asian market entry across all four workstreams.",
    targetDate: "2026-12-31",
    estimatedHours: 5400,
    executiveUpdate: "Market analysis ratified; entity registration filings in progress across SG and VN.",
    blockers: [],
    timeline: [
      { date: "JUN 01", title: "Market Analysis Complete", complete: true },
      { date: "JUN 22", title: "Entity Registration", detail: "In progress in SG and VN.", complete: false },
      { date: "AUG 15", title: "Logistics Pilot", complete: false },
    ],
  },
];

export const getProject = (id: string) => projects.find((p) => p.id === id);

export const workstreamColors: Record<Workstream, string> = {
  OX: "workstream-ox",
  EX: "workstream-ex",
  AU: "workstream-au",
  DW: "workstream-dw",
};

export const workstreamLabel: Record<Workstream, string> = {
  OX: "Operational Excellence (OX)",
  EX: "Executive Strategy (EX)",
  AU: "Automation Unit (AU)",
  DW: "Data Warehouse (DW)",
};

export const priorityStyle: Record<Priority, { bg: string; text: string }> = {
  Critical: { bg: "bg-status-critical/10", text: "text-status-critical" },
  High: { bg: "bg-status-critical/10", text: "text-status-critical" },
  Medium: { bg: "bg-status-medium/10", text: "text-status-medium" },
  Low: { bg: "bg-status-low/10", text: "text-status-low" },
};

export const statusStyle: Record<Status, { bg: string; text: string }> = {
  "On Track": { bg: "bg-status-low/10", text: "text-status-low" },
  "In Progress": { bg: "bg-primary/10", text: "text-primary" },
  Blocked: { bg: "bg-status-medium/10", text: "text-status-medium" },
  Delayed: { bg: "bg-status-high/10", text: "text-status-high" },
  Completed: { bg: "bg-status-low/10", text: "text-status-low" },
};
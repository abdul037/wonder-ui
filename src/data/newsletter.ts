import type { Workstream } from "./projects";

export interface UpdateEntry {
  id: string;
  title: string;
  summary: string;
  body: string;
  workstream: Workstream;
  author: { name: string; initials: string };
  publishedAt: string; // ISO
  projectId?: string;
  featured?: boolean;
  tag?: "Release" | "Enhancement" | "Heads Up" | "Roadblocker Cleared";
}

export interface NewsletterIssue {
  number: number;
  title: string;
  publishedAt: string;
  intro: string;
}

export const currentIssue: NewsletterIssue = {
  number: 14,
  title: "SCM Tech Pulse",
  publishedAt: "2026-06-30T08:00:00Z",
  intro:
    "Live operational and tech updates from across the Supply Chain organization — releases, enhancements, blockers cleared, and what's shipping this week.",
};

export const updates: UpdateEntry[] = [
  {
    id: "u-001",
    title: "Fero Auto-Plan v2 telemetry schema finalized",
    summary:
      "Schema v2 unlocks live carrier telemetry into the routing engine — pilot DCs see a 6% reduction in mid-mile dwell.",
    body:
      "Following two weeks of joint design with Fero Global Systems, the v2 telemetry schema is locked. Migration script merged to main; canary rollout begins Monday across SG and VN distribution centers. OAuth credential handoff remains the only outstanding blocker before full production cutover.",
    workstream: "OX",
    author: { name: "Sarah Jenkins", initials: "SJ" },
    publishedAt: "2026-06-30T07:12:00Z",
    projectId: "fero-auto-plan",
    featured: true,
    tag: "Enhancement",
  },
  {
    id: "u-002",
    title: "Bulk WeighScale UAT round 3 — 92% pass rate",
    summary:
      "Reconciliation deltas held at 0.4% across 14 distribution centers. Change board review scheduled for next week.",
    body:
      "All four pilot DCs are passing reconciliation. Cutover plan has been submitted for change board approval. Expect production cutover within three days of approval.",
    workstream: "DW",
    author: { name: "Marcus Vega", initials: "MV" },
    publishedAt: "2026-06-30T04:00:00Z",
    projectId: "bulk-weighscale",
    tag: "Release",
  },
  {
    id: "u-003",
    title: "Data Stream 2.0 — canary consumers live in staging",
    summary:
      "Additive schema rollout validated by canary consumers; full migration guide drafted for downstream teams.",
    body:
      "The versioned schema registry is now serving canary consumers in staging. Additive fields are flowing without breaking changes. Consumer migration guide has been circulated to all downstream platform teams.",
    workstream: "DW",
    author: { name: "Hana Patel", initials: "HP" },
    publishedAt: "2026-06-30T01:15:00Z",
    projectId: "data-stream-2",
    tag: "Enhancement",
  },
  {
    id: "u-004",
    title: "Driver App OCR — TensorFlow Lite leads benchmark",
    summary: "On-device OCR benchmarking complete. TFLite wins on latency; final library selection next sprint.",
    body:
      "Benchmarking across three OCR libraries (TFLite, MLKit, Tesseract Mobile) is complete. TensorFlow Lite leads on latency and accuracy at 96.3% on proof-of-delivery slips. Final recommendation lands in Sprint 25 review.",
    workstream: "AU",
    author: { name: "Devon Park", initials: "DP" },
    publishedAt: "2026-06-29T09:20:00Z",
    projectId: "driver-app-ocr",
    tag: "Heads Up",
  },
  {
    id: "u-005",
    title: "Global Expansion — entity registration filings in progress",
    summary: "SG and VN filings submitted; logistics pilot vendor shortlist now circulating.",
    body:
      "Phase 4 of the global expansion roadmap is underway. Entity registration filings are progressing in Singapore and Vietnam. Logistics pilot vendor shortlist circulated for executive review.",
    workstream: "EX",
    author: { name: "Anika Rao", initials: "AR" },
    publishedAt: "2026-06-30T06:45:00Z",
    projectId: "global-expansion",
    tag: "Heads Up",
  },
  {
    id: "u-006",
    title: "Experience Portal redesign — feedback delay flagged",
    summary: "Stakeholder feedback on profile redesign delayed by quarterly offsite. Milestone at risk.",
    body:
      "The hi-fi mocks delivered two weeks ago are awaiting leadership review. With the quarterly offsite running through Friday, expect feedback no earlier than the following Monday. October milestone marked at risk.",
    workstream: "EX",
    author: { name: "Mark Stein", initials: "MS" },
    publishedAt: "2026-06-29T17:00:00Z",
    projectId: "experience-portal",
    tag: "Heads Up",
  },
];

export const workstreamDigest: Record<Workstream, { title: string; highlights: string[] }> = {
  OX: {
    title: "Operational Excellence",
    highlights: [
      "Fero Auto-Plan telemetry schema v2 finalized",
      "Mid-mile dwell down 6% across SG/VN pilots",
      "Routing heuristics backtesting on Q1 loads",
    ],
  },
  EX: {
    title: "Executive Strategy",
    highlights: [
      "Global expansion entity filings in motion",
      "Logistics pilot vendor shortlist circulating",
      "Experience portal feedback awaiting leadership review",
    ],
  },
  AU: {
    title: "Automation Unit",
    highlights: [
      "Driver App OCR benchmark complete — TFLite leads",
      "Lo-fi driver UX mocks circulated",
      "Sprint 25 scoping kicked off",
    ],
  },
  DW: {
    title: "Data Warehouse",
    highlights: [
      "Data Stream 2.0 canary consumers live in staging",
      "Bulk WeighScale UAT round 3 at 92% pass",
      "Consumer migration guide drafted for downstream teams",
    ],
  },
};
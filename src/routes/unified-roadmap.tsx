import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/unified-roadmap")({
  head: () => ({
    meta: [
      { title: "Unified Roadmap | Supply Chain Tech Hub" },
      { name: "description", content: "Muwahib Delivery Roadmap — a single view of what is live, on-deck and next across all workstreams." },
      { property: "og:title", content: "Unified Roadmap | Supply Chain Tech Hub" },
      { property: "og:description", content: "Workstream readout across active, BAU and pipeline initiatives." },
    ],
  }),
  component: UnifiedRoadmap,
});

/* -------------- stream tokens -------------- */
type Stream = "OX" | "DW" | "AI" | "EX";
const STREAM = {
  OX: { label: "Operational Excellence", dot: "#6366f1", text: "text-indigo-500" },
  DW: { label: "Data Warehouse / BI", dot: "#0d9488", text: "text-teal-600" },
  AI: { label: "AI / Applications", dot: "#a855f7", text: "text-purple-500" },
  EX: { label: "Employee Experience", dot: "#22c55e", text: "text-emerald-500" },
} as const;

/* -------------- content (matches reference) -------------- */
const ACTIVE: { name: string; status: "In Progress" | "Scoping"; tags?: string }[] = [
  { name: "Auto Plan", status: "In Progress", tags: "OX" },
  { name: "Delivery Enhancement Process — KSA", status: "In Progress", tags: "OX" },
  { name: "Industrial KPI — QHSE", status: "In Progress", tags: "DW / PowerBI" },
  { name: "Industrial KPI — Distribution", status: "In Progress", tags: "DW / PowerBI" },
  { name: "Fero — Data Model (Synapse)", status: "In Progress", tags: "DW / PowerBI" },
  { name: "Item Code Creation Process", status: "Scoping" },
  { name: "User Access Management", status: "In Progress", tags: "OX" },
  { name: "Driver Working-Hours Changes", status: "In Progress", tags: "OX" },
  { name: "SafeCount App", status: "In Progress", tags: "AI" },
  { name: "LetterHead Management App", status: "In Progress", tags: "AI" },
  { name: "Customer Notification Module — Enhancement", status: "In Progress", tags: "OX" },
];

const PIPELINE: Record<Stream, string[]> = {
  OX: [
    "WeighScale Integration",
    "ZFScalar — Sensor data integration",
    "Trip Scheduling Enhancement Rollout",
    "CIGT feature rollout",
    "E-DN / Paperless deliveries",
    "Customer Notification rollout",
    "Operation Module — Fero (3rd Party + GC IVMS)",
    "CIGT Requests (Maintenance trips)",
    "DOA for On-Site, Order Cancellation",
    "KW — MOH Delivery process enhancement",
  ],
  DW: ["Distribution Reports — Migration", "QHSE Reports"],
  AI: [
    "Fero GPT",
    "Foundry — Agent Builder",
    "Talent Acquisition System",
    "Training & Development",
    "Consequence Management System",
  ],
  EX: ["Driver Bonus Module"],
};

const BAU = [
  "Fero Dispatcher Portal / Driver App queries",
  "Fero — D365 Integration queries",
  "PowerBI reporting queries",
  "Lytx — Dashcam queries",
  "Month End Closing — DN",
];

const STREAM_COUNTS: Record<Stream, number> = { OX: 20, DW: 6, AI: 7, EX: 1 };
const BIG_IMPACT_SCOPE = [
  "Revamped Production Process",
  "Gate Security",
  "Enhanced Delivery System",
  "Inter & Intra-Org Deliveries",
  "Automated Rentals & Asset Tracking",
  "App-Side Enhancement",
];

/* -------------- component -------------- */
function UnifiedRoadmap() {
  const totalItems = Object.values(STREAM_COUNTS).reduce((a, b) => a + b, 0);
  const [activeFilter, setActiveFilter] = useState<Stream | null>(null);

  const pipelineEntries = (Object.keys(PIPELINE) as Stream[]).filter(
    (s) => !activeFilter || activeFilter === s,
  );

  return (
    <AppShell>
      <div className="px-10 py-10 max-w-[1400px] mx-auto font-[Inter] text-slate-900">
        {/* HEADER */}
        <header className="flex items-start justify-between gap-8 pb-6">
          <div>
            <p className="text-[11px] tracking-[0.22em] font-semibold text-slate-400 uppercase mb-3">
              Technology &amp; Data · Workstream Readout
            </p>
            <h1 className="text-[44px] leading-[1.05] font-black tracking-tight text-slate-900">
              Muwahib : Delivery Roadmap
            </h1>
            <p className="text-[13px] text-slate-500 mt-2">
              A single view of what's live, what's on-deck, and what's next.
            </p>
          </div>
          <div className="flex items-start gap-7 pt-2 border-l border-slate-200 pl-7">
            {[
              { v: 11, l: "Active" },
              { v: 5, l: "BAU" },
              { v: 18, l: "Pipeline" },
            ].map((m) => (
              <div key={m.l} className="text-center">
                <div className="text-[28px] font-black leading-none text-slate-900">{m.v}</div>
                <div className="text-[10px] tracking-[0.18em] uppercase text-slate-400 mt-1.5 font-semibold">
                  {m.l}
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* STREAM LOAD BAR */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] tracking-[0.22em] uppercase font-semibold text-slate-400">
              Stream Load · {totalItems} Items
            </p>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              {(Object.keys(STREAM) as Stream[]).map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: STREAM[s].dot }} />
                  <span className="font-bold text-slate-700">
                    {s === "DW" ? "DW / PowerBI" : s}
                  </span>
                  <span className="text-slate-400">{STREAM_COUNTS[s]}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="flex h-[6px] rounded-full overflow-hidden bg-slate-100">
            {(Object.keys(STREAM) as Stream[]).map((s) => (
              <div
                key={s}
                style={{
                  width: `${(STREAM_COUNTS[s] / totalItems) * 100}%`,
                  background: STREAM[s].dot,
                }}
              />
            ))}
          </div>
        </section>

        {/* BIG IMPACT */}
        <section className="relative bg-[#0b1226] text-white rounded-2xl px-8 py-7 mb-10 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-[220px] border-r border-white/5" />
          <div className="grid grid-cols-[200px_1fr] gap-8 relative">
            <div className="flex items-start">
              <span className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase font-semibold text-indigo-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Big Impact Project
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-[28px] font-black tracking-tight">Asset Tracking Revamp</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  OX
                </span>
              </div>
              <p className="text-[10px] tracking-[0.22em] uppercase font-semibold text-slate-400 mb-3">
                Scope · 6 Workstreams
              </p>
              <div className="flex flex-wrap gap-2">
                {BIG_IMPACT_SCOPE.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-white/5 border border-white/15 text-slate-100 hover:bg-white/10 transition"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* THREE COLUMNS */}
        <section className="grid grid-cols-[1fr_1.4fr_0.9fr] gap-8">
          {/* 01 ACTIVE */}
          <div>
            <ColumnHeader num="01" title="Active Major Projects" count={11} />
            <p className="text-[11px] text-slate-500 mt-1 mb-4 font-mono">
              10 In Progress · 1 Scoping
            </p>
            <ul className="space-y-2">
              {ACTIVE.map((p) => (
                <li
                  key={p.name}
                  className="border border-slate-200 rounded-lg px-3.5 py-3 flex items-center justify-between gap-3 hover:border-slate-300 transition"
                >
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold leading-tight text-slate-900">
                      {p.name}
                    </p>
                    {p.tags && (
                      <p className="text-[10px] text-slate-400 font-mono mt-1">{p.tags}</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      p.status === "Scoping"
                        ? "bg-orange-50 text-orange-600"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 02 PIPELINE */}
          <div>
            <ColumnHeader num="02" title="Pipeline Projects" count={18} />
            <div className="mt-5 space-y-5">
              {pipelineEntries.map((s) => {
                const items = PIPELINE[s];
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: STREAM[s].dot }}
                        />
                        <span className={`text-[11px] font-bold ${STREAM[s].text}`}>
                          {s === "DW" ? "DW / PowerBI" : s}
                        </span>
                        <span className="text-[11px] text-slate-400">{STREAM[s].label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{items.length}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((name) => (
                        <div
                          key={name}
                          className="border border-slate-200 rounded-md px-3 py-2 text-[11.5px] text-slate-700 flex items-start gap-2 leading-snug hover:border-slate-300 transition"
                        >
                          <span
                            className="w-1 h-1 rounded-full mt-2 shrink-0"
                            style={{ background: STREAM[s].dot }}
                          />
                          <span>{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Small-scale bundle */}
              <div className="flex items-center gap-4 rounded-lg border border-indigo-200 bg-indigo-50/60 px-4 py-3">
                <div className="text-[22px] font-black text-indigo-600 leading-none">+15</div>
                <div>
                  <p className="text-[12.5px] font-bold text-slate-900">Small-scale enhancements</p>
                  <p className="text-[11px] text-slate-500">
                    Minor quick-win improvements bundled across streams.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 03 BAU + Stream filter */}
          <div>
            <ColumnHeader num="03" title="BAU / Always-On" count={5} />
            <ul className="space-y-2 mt-4">
              {BAU.map((b, i) => {
                const colors = ["#6366f1", "#0d9488", "#a855f7", "#f97316", "#0ea5e9"];
                return (
                  <li
                    key={b}
                    className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[12px] font-medium text-slate-700 border-l-[3px]"
                    style={{ borderLeftColor: colors[i % colors.length] }}
                  >
                    {b}
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] tracking-[0.18em] uppercase font-semibold text-slate-400 mb-3">
                Streams · Click to Filter
              </p>
              <ul className="space-y-2.5">
                {(Object.keys(STREAM) as Stream[]).map((s) => {
                  const active = activeFilter === s;
                  return (
                    <li key={s}>
                      <button
                        onClick={() => setActiveFilter(active ? null : s)}
                        className={`w-full flex items-center gap-3 text-left rounded-md px-1.5 py-1 transition ${
                          active ? "bg-slate-100" : "hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: STREAM[s].dot }}
                        />
                        <span className={`text-[11px] font-bold w-20 ${STREAM[s].text}`}>
                          {s === "DW" ? "DW / PowerBI" : s}
                        </span>
                        <span className="text-[11.5px] text-slate-600 flex-1">
                          {STREAM[s].label}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {STREAM_COUNTS[s]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        <footer className="mt-12 pt-4 border-t border-slate-200 text-[10px] tracking-[0.22em] uppercase font-semibold text-slate-400">
          As of June 2026
        </footer>
      </div>
    </AppShell>
  );
}

function ColumnHeader({
  num,
  title,
  count,
}: {
  num: string;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="text-[11px] font-mono text-slate-400">{num}</span>
      <h3 className="text-[15px] font-black tracking-tight text-slate-900">{title}</h3>
      <span className="text-[12px] font-mono text-slate-400">{count}</span>
    </div>
  );
}
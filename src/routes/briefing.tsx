import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { z } from "zod";
import { projects } from "@/data/projects";
import { pipelineItems } from "@/data/pipeline";
import { updates, workstreamDigest, currentIssue } from "@/data/newsletter";
import { useDataVersion } from "@/lib/store";

const searchSchema = z.object({
  slide: z.coerce.number().int().min(1).optional(),
  notes: z.enum(["0", "1"]).optional(),
});

export const Route = createFileRoute("/briefing")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "SCM Briefing — Supply Chain Tech Hub" },
      { name: "description", content: "Live data-driven briefing deck for the Head of Supply Chain." },
    ],
  }),
  component: BriefingPage,
});

/* ============================================================
   Helpers
============================================================ */

const WS_LABEL: Record<string, string> = {
  OX: "Operation Excellence",
  DW: "Data Warehouse / PowerBI",
  EX: "Employee Experience",
  AU: "Asset Utilization",
};
const WS_TONE: Record<string, string> = {
  OX: "bg-workstream-ox",
  DW: "bg-workstream-dw",
  EX: "bg-workstream-ex",
  AU: "bg-workstream-au",
};
const WS_TEXT: Record<string, string> = {
  OX: "text-workstream-ox",
  DW: "text-workstream-dw",
  EX: "text-workstream-ex",
  AU: "text-workstream-au",
};

function fmtDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

/* ============================================================
   Scaled Slide canvas (1920×1080 → fit viewport)
============================================================ */

function ScaledSlide({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function update() {
      if (!wrapRef.current) return;
      const { width, height } = wrapRef.current.getBoundingClientRect();
      setScale(Math.min(width / 1920, height / 1080));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full h-full overflow-hidden bg-[#0b0d12]">
      <div
        className="slide-content absolute left-1/2 top-1/2 bg-white text-on-surface"
        style={{
          marginLeft: -960,
          marginTop: -540,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   Reusable slide chrome
============================================================ */

function SlideFrame({
  index,
  total,
  kicker,
  children,
  tone = "light",
}: {
  index: number;
  total: number;
  kicker?: string;
  children: ReactNode;
  tone?: "light" | "dark" | "primary";
}) {
  const bg =
    tone === "dark"
      ? "bg-[#0b0d12] text-white"
      : tone === "primary"
        ? "bg-primary text-on-primary"
        : "bg-white text-on-surface";
  return (
    <div className={`w-full h-full flex flex-col ${bg}`}>
      <header className="flex items-center justify-between px-20 pt-14">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary grid place-items-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 32 }}>
              insights
            </span>
          </div>
          <div>
            <div className="slide-kicker opacity-70">Supply Chain Tech Hub</div>
            {kicker && <div className="slide-kicker mt-1">{kicker}</div>}
          </div>
        </div>
        <div className="slide-page opacity-60">
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
      </header>
      <div className="flex-1 px-20 pt-10 pb-14 flex flex-col min-h-0">{children}</div>
      <footer className="px-20 pb-10 flex items-center justify-between slide-footer opacity-60">
        <span>SCM Monthly Briefing · {fmtDate(new Date())}</span>
        <span>Confidential — Internal use</span>
      </footer>
    </div>
  );
}

function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "ok" | "warn" | "bad" | "info" }) {
  const map: Record<string, string> = {
    muted: "bg-black/5 text-on-surface",
    ok: "bg-status-low/15 text-status-low",
    warn: "bg-status-medium/15 text-status-medium",
    bad: "bg-status-critical/15 text-status-critical",
    info: "bg-primary/10 text-primary",
  };
  return <span className={`slide-badge inline-flex items-center px-5 py-2 rounded-full font-semibold ${map[tone]}`}>{children}</span>;
}

function statusTone(s: string): "ok" | "warn" | "bad" | "info" {
  if (s === "Completed") return "ok";
  if (s === "Blocked") return "bad";
  if (s === "Delayed") return "warn";
  if (s === "In Progress") return "info";
  return "ok";
}

/* ============================================================
   Individual slides
============================================================ */

function SlideCover({ index, total }: { index: number; total: number }) {
  return (
    <SlideFrame index={index} total={total} tone="dark" kicker="Monthly Briefing">
      <div className="flex-1 flex flex-col justify-center">
        <div className="slide-kicker text-primary-fixed mb-8">For: Head of Supply Chain</div>
        <h1 className="slide-title-lg max-w-[1500px]">
          Where supply-chain technology stands this month.
        </h1>
        <p className="slide-subtitle opacity-70 mt-10 max-w-[1300px]">
          A live snapshot of active projects, the actions in flight, the blockers we need help with, and what's coming next.
        </p>
        <div className="mt-14 flex items-center gap-6">
          <Pill tone="info">{fmtDate(new Date())}</Pill>
          <Pill>Marcus Sterling · Chief Project Officer</Pill>
        </div>
      </div>
    </SlideFrame>
  );
}

function SlideHeadlineNumbers({ index, total }: { index: number; total: number }) {
  const active = projects.length;
  const actions = projects.reduce((n, p) => n + p.tasks.length, 0);
  const blockers = projects.filter((p) => p.status === "Blocked").length;
  const intake = pipelineItems.length;
  const items = [
    { n: active, label: "Active major projects", tone: "info" as const },
    { n: actions, label: "Actions in flight", tone: "ok" as const },
    { n: blockers, label: "Projects blocked", tone: "bad" as const },
    { n: intake, label: "Pipeline intake", tone: "warn" as const },
  ];
  const toneBg: Record<string, string> = {
    info: "border-primary/20",
    ok: "border-status-low/30",
    bad: "border-status-critical/30",
    warn: "border-status-medium/30",
  };
  return (
    <SlideFrame index={index} total={total} kicker="Headline numbers">
      <h2 className="slide-title mb-12">The shape of the portfolio.</h2>
      <div className="grid grid-cols-4 gap-8 flex-1">
        {items.map((it) => (
          <div key={it.label} className={`rounded-3xl border-2 ${toneBg[it.tone]} bg-white p-10 flex flex-col justify-between`}>
            <div className="slide-kicker opacity-60">{it.label}</div>
            <div className="font-display font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", fontSize: 180, lineHeight: 1, letterSpacing: "-0.05em" }}>
              {it.n}
            </div>
            <Pill tone={it.tone}>{it.tone === "bad" ? "Needs attention" : it.tone === "warn" ? "Watch" : "Healthy"}</Pill>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

function SlideWorkstreamScorecard({ index, total }: { index: number; total: number }) {
  const wsKeys: Array<"OX" | "DW" | "EX" | "AU"> = ["OX", "DW", "EX", "AU"];
  return (
    <SlideFrame index={index} total={total} kicker="Workstream scorecard">
      <h2 className="slide-title mb-10">Where each workstream stands.</h2>
      <div className="grid grid-cols-2 gap-8 flex-1">
        {wsKeys.map((ws) => {
          const ps = projects.filter((p) => p.workstream === ws);
          const blocked = ps.filter((p) => p.status === "Blocked").length;
          const highlight = workstreamDigest[ws]?.highlights[0] ?? "—";
          const risk = ps.find((p) => p.status === "Blocked" || p.status === "Delayed");
          return (
            <div key={ws} className="rounded-3xl border border-black/10 p-10 flex flex-col">
              <div className="flex items-center gap-4 mb-5">
                <span className={`w-3 h-12 rounded-full ${WS_TONE[ws]}`} />
                <div>
                  <div className={`slide-kicker ${WS_TEXT[ws]}`}>{ws}</div>
                  <div className="slide-subtitle font-semibold">{WS_LABEL[ws]}</div>
                </div>
                <div className="ml-auto flex gap-3">
                  <Pill tone="info">{ps.length} projects</Pill>
                  {blocked > 0 && <Pill tone="bad">{blocked} blocked</Pill>}
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="slide-kicker opacity-50 mb-1">Highlight</div>
                  <div className="slide-body">{highlight}</div>
                </div>
                <div>
                  <div className="slide-kicker opacity-50 mb-1">Risk</div>
                  <div className="slide-body">{risk ? risk.name : "No active risks."}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SlideFrame>
  );
}

function SlideWins({ index, total }: { index: number; total: number }) {
  const wins = projects
    .flatMap((p) => p.tasks.filter((t) => t.status === "Completed").map((t) => ({ t, p })))
    .slice(0, 4);
  return (
    <SlideFrame index={index} total={total} kicker="Wins this period">
      <h2 className="slide-title mb-10">Shipped. Done. In production.</h2>
      {wins.length === 0 ? (
        <p className="slide-body opacity-60">No completed actions tagged in this window yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-8 flex-1">
          {wins.map(({ t, p }) => (
            <div key={t.id} className="rounded-3xl border border-status-low/30 bg-status-low/5 p-10 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-status-low" style={{ fontSize: 40 }}>check_circle</span>
                <Pill tone="ok">Completed</Pill>
                <Pill tone="info">{p.workstream}</Pill>
              </div>
              <div className="slide-subtitle font-semibold">{t.name}</div>
              <div className="slide-body opacity-70 mt-3">{p.name}</div>
              <div className="slide-caption opacity-60 mt-auto">Owner · {t.techOwner.name}</div>
            </div>
          ))}
        </div>
      )}
    </SlideFrame>
  );
}

function SlideInFlight({ index, total }: { index: number; total: number }) {
  const focus = projects
    .filter((p) => p.status !== "Completed")
    .sort((a, b) => (a.priority === "Critical" ? -1 : 1))
    .slice(0, 3);
  return (
    <SlideFrame index={index} total={total} kicker="In flight · focus">
      <h2 className="slide-title mb-10">Three projects worth your attention.</h2>
      <div className="grid grid-cols-3 gap-8 flex-1">
        {focus.map((p) => (
          <div key={p.id} className="rounded-3xl border border-black/10 p-10 flex flex-col">
            <span className={`w-2 h-14 rounded-full ${WS_TONE[p.workstream]} mb-5`} />
            <Pill tone={statusTone(p.status)}>{p.status}</Pill>
            <div className="slide-subtitle font-semibold mt-4">{p.name}</div>
            <div className="slide-body opacity-70 mt-3 line-clamp-4">{p.summary}</div>
            <div className="mt-auto pt-6 border-t border-black/10 space-y-2">
              <div className="slide-caption"><span className="opacity-50">Tech</span> · {p.techOwner.name}</div>
              <div className="slide-caption"><span className="opacity-50">Business</span> · {p.businessOwner.name}</div>
              <div className="slide-caption"><span className="opacity-50">Target</span> · {p.targetDate}</div>
            </div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

function SlideBlockers({ index, total }: { index: number; total: number }) {
  const blocked = projects.filter((p) => p.status === "Blocked" || p.blockers.length > 0).slice(0, 4);
  return (
    <SlideFrame index={index} total={total} tone="dark" kicker="Risks & blockers">
      <h2 className="slide-title-lg mb-10 text-status-critical">What's stuck — and how you can help.</h2>
      {blocked.length === 0 ? (
        <p className="slide-body opacity-70">No blockers raised this cycle.</p>
      ) : (
        <div className="grid grid-cols-2 gap-8 flex-1">
          {blocked.map((p) => {
            const b = p.blockers[0];
            return (
              <div key={p.id} className="rounded-3xl border border-status-critical/40 bg-status-critical/10 p-10 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-status-critical" style={{ fontSize: 40 }}>error</span>
                  <Pill tone="bad">Blocked</Pill>
                  <Pill tone="info">{p.workstream}</Pill>
                </div>
                <div className="slide-subtitle font-semibold text-white">{p.name}</div>
                <div className="slide-body opacity-80 mt-3">{b?.detail ?? p.blocker ?? "Awaiting unblock action."}</div>
                <div className="slide-caption opacity-60 mt-auto pt-4">Owner · {p.currentlyWith.name} · Age {b?.ago ?? "—"}</div>
              </div>
            );
          })}
        </div>
      )}
    </SlideFrame>
  );
}

function SlidePipeline({ index, total }: { index: number; total: number }) {
  const upcoming = pipelineItems
    .filter((p) => p.stage === "Approved" || p.stage === "Scheduled")
    .slice(0, 5);
  return (
    <SlideFrame index={index} total={total} kicker="Pipeline · what's next">
      <h2 className="slide-title mb-10">Already approved and queued up.</h2>
      <div className="space-y-5">
        {upcoming.map((p) => (
          <div key={p.id} className="rounded-2xl border border-black/10 p-7 flex items-center gap-8">
            <span className={`w-2 h-16 rounded-full ${WS_TONE[p.workstream]}`} />
            <div className="flex-1 min-w-0">
              <div className="slide-subtitle font-semibold truncate">{p.name}</div>
              <div className="slide-caption opacity-70 mt-1 line-clamp-1">{p.description}</div>
            </div>
            <Pill tone="info">{p.stage}</Pill>
            <Pill>{p.effort} effort</Pill>
            <div className="slide-caption opacity-70 w-[260px] text-right">Expected {p.expectedStart}</div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

function SlideRoadmap({ index, total }: { index: number; total: number }) {
  const quarters = ["Q3 2026", "Q4 2026", "Q1 2027", "Q2 2027"];
  const wsKeys: Array<"OX" | "DW" | "EX" | "AU"> = ["OX", "DW", "EX", "AU"];
  return (
    <SlideFrame index={index} total={total} kicker="Period roadmap">
      <h2 className="slide-title mb-10">The next four quarters.</h2>
      <div className="rounded-3xl border border-black/10 overflow-hidden flex-1">
        <div className="grid" style={{ gridTemplateColumns: "180px repeat(4, 1fr)" }}>
          <div className="bg-black/5 p-5 slide-kicker opacity-60">Workstream</div>
          {quarters.map((q, i) => (
            <div key={q} className={`p-5 slide-kicker ${i === 0 ? "bg-primary/10 text-primary" : "bg-black/5 opacity-60"}`}>
              {q} {i === 0 && "· now"}
            </div>
          ))}
          {wsKeys.map((ws) => {
            const ps = projects.filter((p) => p.workstream === ws);
            return (
              <div key={ws} className="contents">
                <div className="p-5 border-t border-black/10 flex items-center gap-3">
                  <span className={`w-2 h-8 rounded-full ${WS_TONE[ws]}`} />
                  <span className="slide-caption font-semibold">{ws}</span>
                </div>
                {quarters.map((q, qi) => (
                  <div key={q} className={`p-5 border-t border-l border-black/10 ${qi === 0 ? "bg-primary/5" : ""}`}>
                    {ps.slice(qi, qi + 1).map((p) => (
                      <div key={p.id} className="rounded-xl bg-white border border-black/10 p-3 slide-caption">
                        <div className="font-semibold truncate">{p.name}</div>
                        <div className="opacity-60 truncate">{p.progressLabel}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </SlideFrame>
  );
}

function SlideTechPulse({ index, total }: { index: number; total: number }) {
  const featured = updates.find((u) => u.featured) ?? updates[0];
  const others = updates.filter((u) => u.id !== featured.id).slice(0, 3);
  return (
    <SlideFrame index={index} total={total} kicker={`Tech Pulse · Issue #${currentIssue.number}`}>
      <h2 className="slide-title mb-10">{featured.title}</h2>
      <div className="grid grid-cols-[1.4fr_1fr] gap-10 flex-1">
        <div className="rounded-3xl bg-primary text-on-primary p-12 flex flex-col">
          <Pill tone="muted">{featured.tag ?? "Update"}</Pill>
          <p className="slide-body-lg mt-8 opacity-95">{featured.summary}</p>
          <div className="mt-auto slide-caption opacity-80">{featured.author.name} · {featured.workstream}</div>
        </div>
        <div className="space-y-5">
          {others.map((u) => (
            <div key={u.id} className="rounded-2xl border border-black/10 p-6">
              <Pill tone="info">{u.workstream}</Pill>
              <div className="slide-subtitle font-semibold mt-3 line-clamp-2" style={{ fontSize: 36 }}>{u.title}</div>
              <div className="slide-caption opacity-70 mt-2 line-clamp-2">{u.summary}</div>
            </div>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}

function SlideAsks({ index, total }: { index: number; total: number }) {
  const blocked = projects.filter((p) => p.status === "Blocked");
  const asks = [
    blocked[0] && `Help unblock ${blocked[0].name} — owner ${blocked[0].currentlyWith.name}.`,
    "Confirm priority of the next two pipeline intakes for Q4 planning.",
    "Approve the Tech Pulse cadence (weekly) and named distribution list.",
  ].filter(Boolean) as string[];
  return (
    <SlideFrame index={index} total={total} tone="primary" kicker="Asks">
      <h2 className="slide-title-lg mb-12">What we need from you.</h2>
      <div className="space-y-8 flex-1">
        {asks.map((a, i) => (
          <div key={i} className="flex items-start gap-8">
            <div className="w-20 h-20 rounded-2xl bg-white/15 grid place-items-center slide-subtitle font-bold shrink-0">
              {i + 1}
            </div>
            <p className="slide-body-lg leading-snug">{a}</p>
          </div>
        ))}
      </div>
      <p className="slide-caption opacity-80 mt-12">Thank you. Questions welcome.</p>
    </SlideFrame>
  );
}

/* ============================================================
   Slide registry + page shell
============================================================ */

type SlideDef = {
  id: string;
  label: string;
  render: (i: number, t: number) => ReactNode;
  notes: string;
};

const slideDefs: SlideDef[] = [
  { id: "cover",     label: "Cover",                render: (i, t) => <SlideCover index={i} total={t} />,              notes: "Set the room. State the audience (Head of SCM) and the 8-minute promise." },
  { id: "headline",  label: "Headline numbers",     render: (i, t) => <SlideHeadlineNumbers index={i} total={t} />,    notes: "Anchor on four numbers. Don't editorialize yet — let them land." },
  { id: "workstream",label: "Workstream scorecard", render: (i, t) => <SlideWorkstreamScorecard index={i} total={t}/>, notes: "Walk OX → DW → EX → AU. Each gets ~30s: highlight + risk." },
  { id: "wins",      label: "Wins this period",     render: (i, t) => <SlideWins index={i} total={t} />,                notes: "Credit the owners by name. Builds trust before risks." },
  { id: "focus",     label: "In flight · focus",    render: (i, t) => <SlideInFlight index={i} total={t} />,            notes: "Three projects only. Tie each to next milestone, not history." },
  { id: "blockers",  label: "Risks & blockers",     render: (i, t) => <SlideBlockers index={i} total={t} />,            notes: "Be specific about the ask. Don't bury escalations." },
  { id: "pipeline",  label: "What's next",          render: (i, t) => <SlidePipeline index={i} total={t} />,            notes: "Confirm the queue is aligned with business priorities." },
  { id: "roadmap",   label: "Roadmap snapshot",     render: (i, t) => <SlideRoadmap index={i} total={t} />,             notes: "Anchor on the current quarter; the rest is direction-of-travel." },
  { id: "pulse",     label: "Tech Pulse",           render: (i, t) => <SlideTechPulse index={i} total={t} />,           notes: "Mention the publishing cadence and who receives it." },
  { id: "asks",      label: "Asks",                 render: (i, t) => <SlideAsks index={i} total={t} />,                notes: "Pause after each ask. Capture the answer in the room." },
];

function BriefingPage() {
  // Subscribe so admin edits reflect mid-meeting.
  useDataVersion();
  const { slide, notes } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const total = slideDefs.length;
  const current = Math.min(Math.max(slide ?? 1, 1), total);
  const def = slideDefs[current - 1];
  const notesOn = notes === "1";

  const go = (n: number) =>
    navigate({
      search: (s: { slide?: number; notes?: "0" | "1" }) => ({
        ...s,
        slide: Math.min(Math.max(n, 1), total),
      }),
      replace: true,
    });
  const toggleNotes = () =>
    navigate({
      search: (s: { slide?: number; notes?: "0" | "1" }) => ({
        ...s,
        notes: notesOn ? "0" : "1",
      }),
      replace: true,
    });

  useEffect(() => {
    document.title = `${current}/${total} · ${def.label} — SCM Briefing`;
  }, [current, def.label, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(current + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(current - 1);
      } else if (e.key === "Home") {
        go(1);
      } else if (e.key === "End") {
        go(total);
      } else if (e.key === "n" || e.key === "N") {
        toggleNotes();
      } else if (e.key === "f" || e.key === "F") {
        const el = document.documentElement;
        if (!document.fullscreenElement) el.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, total, notesOn]);

  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = railRef.current?.querySelector<HTMLButtonElement>(`button[data-i='${current}']`);
    el?.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
  }, [current]);

  const slideEl = useMemo(() => def.render(current, total), [def, current, total]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#0b0d12] text-white overflow-hidden">
      {/* Top control strip */}
      <header className="flex items-center gap-4 px-5 h-12 border-b border-white/10 shrink-0">
        <Link to="/" className="flex items-center gap-2 text-xs text-white/70 hover:text-white">
          <span className="material-symbols-outlined !text-[18px]">arrow_back</span>
          Exit briefing
        </Link>
        <div className="h-5 w-px bg-white/15" />
        <div className="text-xs font-bold tracking-wide uppercase text-white/80">{def.label}</div>
        <div className="text-xs text-white/40">Slide {current} of {total}</div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleNotes}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${notesOn ? "bg-white text-[#0b0d12]" : "bg-white/10 hover:bg-white/20"}`}
            title="Toggle presenter notes (N)"
          >
            <span className="material-symbols-outlined !text-[15px] mr-1 align-middle">sticky_note_2</span>
            Notes
          </button>
          <button
            onClick={() => {
              const el = document.documentElement;
              if (!document.fullscreenElement) el.requestFullscreen?.();
              else document.exitFullscreen?.();
            }}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white/10 hover:bg-white/20"
            title="Fullscreen (F)"
          >
            <span className="material-symbols-outlined !text-[15px] mr-1 align-middle">fullscreen</span>
            Fullscreen
          </button>
        </div>
      </header>

      {/* Slide canvas */}
      <div className="flex-1 min-h-0 flex">
        <div className="flex-1 min-w-0 relative">
          <ScaledSlide>{slideEl}</ScaledSlide>

          {/* Side arrows */}
          <button
            onClick={() => go(current - 1)}
            disabled={current === 1}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 grid place-items-center"
            aria-label="Previous slide"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => go(current + 1)}
            disabled={current === total}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 grid place-items-center"
            aria-label="Next slide"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {notesOn && (
          <aside className="w-[340px] shrink-0 border-l border-white/10 bg-[#11141a] p-5 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] uppercase tracking-widest text-white/50">Presenter notes</div>
            <h3 className="text-sm font-bold mt-1">{def.label}</h3>
            <p className="text-[13px] leading-relaxed text-white/80 mt-3">{def.notes}</p>
            <div className="mt-6 text-[10px] uppercase tracking-widest text-white/50">Keyboard</div>
            <ul className="mt-2 text-[12px] text-white/70 space-y-1.5">
              <li>← / → · Navigate slides</li>
              <li>Space · Next slide</li>
              <li>N · Toggle these notes</li>
              <li>F · Fullscreen</li>
              <li>Home / End · Jump to ends</li>
            </ul>
          </aside>
        )}
      </div>

      {/* Bottom slide rail */}
      <footer className="shrink-0 border-t border-white/10 bg-[#0e1117]">
        <div ref={railRef} className="flex gap-2 overflow-x-auto custom-scrollbar px-4 py-3">
          {slideDefs.map((s, i) => {
            const n = i + 1;
            const active = n === current;
            return (
              <button
                key={s.id}
                data-i={n}
                onClick={() => go(n)}
                className={`shrink-0 w-[112px] h-[68px] rounded-md border text-left p-2 transition ${
                  active ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.03] hover:bg-white/10"
                }`}
                title={s.label}
              >
                <div className="text-[9px] uppercase tracking-widest text-white/40">Slide {n}</div>
                <div className="text-[11px] font-semibold mt-1 line-clamp-2">{s.label}</div>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
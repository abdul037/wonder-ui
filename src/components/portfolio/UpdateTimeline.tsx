import type { UpdateEntry } from "@/data/projects";
import { relativeTime } from "@/lib/time";

const kindStyle: Record<NonNullable<UpdateEntry["kind"]>, { dot: string; chip: string; label: string; icon: string }> = {
  update: { dot: "bg-primary", chip: "bg-primary/10 text-primary", label: "Update", icon: "chat" },
  blocker: { dot: "bg-status-critical", chip: "bg-status-critical/10 text-status-critical", label: "Blocker", icon: "warning" },
  milestone: { dot: "bg-status-low", chip: "bg-status-low/10 text-status-low", label: "Milestone", icon: "flag" },
  system: { dot: "bg-outline", chip: "bg-surface-container text-on-surface-variant", label: "System", icon: "settings" },
};

export function UpdateTimeline({
  entries,
  emptyLabel = "No updates yet — be the first to post.",
  limit,
}: {
  entries: UpdateEntry[];
  emptyLabel?: string;
  limit?: number;
}) {
  if (!entries.length) {
    return (
      <p className="text-xs italic text-on-surface-variant px-1 py-3">{emptyLabel}</p>
    );
  }
  const shown = limit ? entries.slice(0, limit) : entries;
  return (
    <ol className="relative space-y-3 pl-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border-subtle">
      {shown.map((e, i) => {
        const k = kindStyle[e.kind ?? "update"];
        return (
          <li key={`${e.at}-${i}`} className="relative">
            <span className={`absolute -left-[15px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-surface-card ${k.dot}`} />
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${k.chip}`}>
                <span className="material-symbols-outlined !text-[11px]">{k.icon}</span>
                {k.label}
              </span>
              <span className="text-[10px] font-mono text-on-surface-variant">
                {relativeTime(e.at)}
              </span>
              {e.author && (
                <span className="text-[10px] text-on-surface-variant">· {e.author}</span>
              )}
            </div>
            <p className="text-xs text-on-surface leading-snug">{e.text}</p>
          </li>
        );
      })}
      {limit && entries.length > limit && (
        <li className="text-[10px] text-on-surface-variant pl-1">
          + {entries.length - limit} earlier update{entries.length - limit === 1 ? "" : "s"}
        </li>
      )}
    </ol>
  );
}
import { useState } from "react";
import { toast } from "sonner";

interface QuickUpdateProps {
  placeholder?: string;
  onPost: (text: string, asBlocker: boolean) => void;
  disabled?: boolean;
  allowBlockerToggle?: boolean;
  compact?: boolean;
}

export function QuickUpdate({
  placeholder = "Post an update… (Cmd/Ctrl+Enter to send)",
  onPost,
  disabled,
  allowBlockerToggle = false,
  compact = false,
}: QuickUpdateProps) {
  const [text, setText] = useState("");
  const [asBlocker, setAsBlocker] = useState(false);

  if (disabled) return null;

  const submit = () => {
    const t = text.trim();
    if (!t) {
      toast.error("Write something first");
      return;
    }
    onPost(t, asBlocker);
    setText("");
    setAsBlocker(false);
  };

  return (
    <div className={`bg-surface-container-low border border-border-subtle rounded-lg p-2.5 space-y-2 ${compact ? "" : "p-3"}`}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        className="w-full bg-surface-card border border-border-subtle rounded-md px-2.5 py-1.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <div className="flex items-center justify-between gap-2">
        {allowBlockerToggle ? (
          <label className="inline-flex items-center gap-1.5 text-[11px] text-on-surface-variant">
            <input
              type="checkbox"
              checked={asBlocker}
              onChange={(e) => setAsBlocker(e.target.checked)}
              className="accent-status-critical"
            />
            Flag as blocker
          </label>
        ) : (
          <span className="text-[10px] text-on-surface-variant">Cmd/Ctrl + Enter to post</span>
        )}
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-white text-[11px] font-bold disabled:opacity-40 hover:opacity-90"
        >
          <span className="material-symbols-outlined !text-[14px]">send</span>
          Post update
        </button>
      </div>
    </div>
  );
}
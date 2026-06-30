import { useEffect, type ReactNode } from "react";

export function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 560,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div
        className="relative bg-surface-card border border-border-subtle rounded-2xl shadow-2xl w-full overflow-hidden"
        style={{ maxWidth: width }}
      >
        <header className="px-5 py-4 border-b border-border-subtle flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-on-surface">{title}</h3>
            {subtitle && <p className="text-[11px] text-on-surface-variant mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface rounded-full p-1 hover:bg-surface-container-low"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>
        <div className="p-5 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-3">
          {children}
        </div>
        {footer && (
          <footer className="px-5 py-3 border-t border-border-subtle bg-surface-container-low flex items-center justify-end gap-2">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

export const inputCls =
  "w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none";

export const labelCls =
  "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1";
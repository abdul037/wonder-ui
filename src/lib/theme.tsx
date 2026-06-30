import { useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark";
const KEY = "scm.theme";
const listeners = new Set<() => void>();

function read(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(KEY) as ThemeMode | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyToDom(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export function setTheme(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, mode);
  applyToDom(mode);
  listeners.forEach((l) => l());
}

export function toggleTheme() {
  setTheme(read() === "dark" ? "light" : "dark");
}

export function useTheme(): ThemeMode {
  // Server snapshot stays "light"; client snapshot reads the real value
  // synchronously so the toggle button reflects state from the first paint.
  // The <html suppressHydrationWarning> on RootShell tolerates the className diff.
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => read(),
    () => "light" as ThemeMode,
  );
}

/** Inline script string that hydrates the .dark class before paint to prevent FOUC. */
export const themeBootScript = `(() => {
  try {
    var k = ${JSON.stringify(KEY)};
    var v = localStorage.getItem(k);
    if (v !== "light" && v !== "dark") {
      v = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    if (v === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();`;
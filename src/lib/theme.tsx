import { useEffect, useState, useSyncExternalStore } from "react";

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
  // Avoid hydration mismatch: render "light" on the server, swap on mount.
  const mode = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => read(),
    () => "light" as ThemeMode,
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    applyToDom(read());
  }, []);
  return mounted ? mode : "light";
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
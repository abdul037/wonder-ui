import { useSyncExternalStore } from "react";

const KEY = "scm.adminMode";
const listeners = new Set<() => void>();
let mode: boolean = (() => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
})();

function emit() {
  listeners.forEach((l) => l());
}

export function setAdminMode(next: boolean) {
  mode = next;
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, next ? "1" : "0");
    }
  } catch {
    // ignore
  }
  emit();
}

export function toggleAdminMode() {
  setAdminMode(!mode);
}

export function useIsAdmin(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => mode,
    () => false,
  );
}
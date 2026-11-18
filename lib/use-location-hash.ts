"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/**
 * The URL fragment, or null during server rendering and hydration. The fragment
 * never reaches the server, so pages that read it render a loading state first.
 */
export function useLocationHash(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => null
  );
}

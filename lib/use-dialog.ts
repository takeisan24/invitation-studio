import { useEffect, useRef, type RefObject } from "react";

// Open dialogs, innermost last: only the top one reacts to keys.
const stack: symbol[] = [];
let lockCount = 0;
let previousOverflow = "";

// Some dialogs open after an async step, when the trigger button no longer holds focus.
// Remember the last control that was clicked so focus can still go back to it.
let lastClicked: HTMLElement | null = null;
if (typeof document !== "undefined") {
  document.addEventListener(
    "click",
    (e) => {
      lastClicked = (e.target as HTMLElement | null)?.closest<HTMLElement>("button,a,[tabindex]") ?? null;
    },
    true
  );
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Behaviour shared by every modal/drawer: moves focus into the panel when it opens, keeps Tab
 * inside it, closes on Esc, locks page scroll behind it and returns focus to the opener.
 * The panel element needs `tabIndex={-1}` so it can hold focus when it has no controls.
 */
export function useDialog(open: boolean, onClose: () => void, panelRef: RefObject<HTMLElement | null>) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const id = Symbol("dialog");
    stack.push(id);
    const active = document.activeElement as HTMLElement | null;
    const opener = active && active !== document.body ? active : lastClicked;
    if (lockCount++ === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    const focusables = () =>
      Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (panel && !panel.contains(document.activeElement)) (focusables()[0] ?? panel).focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      const panel = panelRef.current;
      if (!panel) return;
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!panel.contains(active) || (e.shiftKey && (active === first || active === panel))) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      stack.splice(stack.indexOf(id), 1);
      if (--lockCount === 0) document.body.style.overflow = previousOverflow;
      if (opener && opener.isConnected) opener.focus();
    };
  }, [open, panelRef]);
}

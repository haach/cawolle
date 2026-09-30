import { useEffect, type RefObject } from "react";

export function useDialog(
  open: boolean,
  close: () => void,
  initialFocus: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;

    initialFocus.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, initialFocus]);
}

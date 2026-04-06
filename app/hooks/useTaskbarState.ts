"use client";

import { useState, useCallback } from "react";

export type TaskbarItemStatus = "focused" | "active" | "none";

export interface TaskbarStateControls {
  /** IDs of all open (active) items, including the focused one. */
  activeIds: ReadonlySet<string>;
  /** The single item that currently has focus, or null. */
  focusedId: string | null;
  /** Mark an item as open/active and give it focus. */
  open: (id: string) => void;
  /** Remove focus from the currently focused item (keeps it active). */
  blur: () => void;
  /** Re-focus an already-active item. */
  focus: (id: string) => void;
  /** Mark an item as inactive and clear focus if it was focused. */
  close: (id: string) => void;
  /** Toggle between focused/active and blurred for an item. */
  toggle: (id: string) => void;
  /** Returns the display status of any item by id. */
  getStatus: (id: string) => TaskbarItemStatus;
}

export function useTaskbarState(initialActive: string[] = []): TaskbarStateControls {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set(initialActive));
  const [focusedId, setFocusedId] = useState<string | null>(
    initialActive.length > 0 ? initialActive[initialActive.length - 1] : null
  );

  const open = useCallback((id: string) => {
    setActiveIds((prev) => new Set([...prev, id]));
    setFocusedId(id);
  }, []);

  const blur = useCallback(() => {
    setFocusedId(null);
  }, []);

  const focus = useCallback((id: string) => {
    setFocusedId(id);
  }, []);

  const close = useCallback((id: string) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setFocusedId((prev) => (prev === id ? null : prev));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      if (focusedId === id) {
        // Currently focused → blur (keep active)
        setFocusedId(null);
      } else if (activeIds.has(id)) {
        // Active but not focused → bring to focus
        setFocusedId(id);
      } else {
        // Not active → open and focus
        setActiveIds((prev) => new Set([...prev, id]));
        setFocusedId(id);
      }
    },
    [activeIds, focusedId]
  );

  const getStatus = useCallback(
    (id: string): TaskbarItemStatus => {
      if (focusedId === id) return "focused";
      if (activeIds.has(id)) return "active";
      return "none";
    },
    [activeIds, focusedId]
  );

  return { activeIds, focusedId, open, blur, focus, close, toggle, getStatus };
}

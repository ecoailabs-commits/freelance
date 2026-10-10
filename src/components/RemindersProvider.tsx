"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { useAuth } from "./AuthProvider";

type RemindersState = {
  isReminded: (eventId: string) => boolean;
  toggle: (eventId: string) => void;
};

const RemindersContext = createContext<RemindersState | null>(null);

/**
 * Holds the set of events the user wants reminders for, shared by every
 * "Remind me" button so the list page and detail page always agree.
 */
export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const { user, requireLogin } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  // Ignore stale responses when the same button is tapped quickly several times.
  const versions = useRef(new Map<string, number>());

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    api<{ eventIds: string[] }>("/api/me/reminders")
      .then((d) => setIds(new Set(d.eventIds)))
      .catch(() => toast.error("Couldn't load your reminders."));
  }, [user]);

  const set = (eventId: string, on: boolean) =>
    setIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(eventId);
      else next.delete(eventId);
      return next;
    });

  const toggle = useCallback(
    (eventId: string) => {
      if (!requireLogin()) return;
      const turnOn = !ids.has(eventId);
      const version = (versions.current.get(eventId) ?? 0) + 1;
      versions.current.set(eventId, version);

      set(eventId, turnOn); // optimistic: update the screen right away

      api(`/api/me/reminders/${eventId}`, { method: turnOn ? "PUT" : "DELETE" }).catch((e) => {
        if (versions.current.get(eventId) !== version) return; // a newer tap already won
        set(eventId, !turnOn); // roll back
        toast.error(`Couldn't ${turnOn ? "set" : "remove"} reminder. ${e.message}`);
      });
    },
    [ids, requireLogin],
  );

  const isReminded = useCallback((eventId: string) => ids.has(eventId), [ids]);

  return (
    <RemindersContext.Provider value={{ isReminded, toggle }}>{children}</RemindersContext.Provider>
  );
}

export function useReminders() {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error("useReminders must be used inside RemindersProvider");
  return ctx;
}

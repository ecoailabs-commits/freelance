"use client";

import { useReminders } from "./RemindersProvider";

export function RemindButton({ eventId, size = "sm" }: { eventId: string; size?: "sm" | "lg" }) {
  const { isReminded, toggle } = useReminders();
  const on = isReminded(eventId);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault(); // card is wrapped in a link
        toggle(eventId);
      }}
      className={`btn ${size === "sm" ? "px-3 py-1.5 text-xs" : "w-full sm:w-auto"} ${
        on
          ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300 hover:bg-amber-200"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
      }`}
    >
      <span aria-hidden>{on ? "🔔" : "🔕"}</span>
      {on ? "Reminder on" : "Remind me"}
    </button>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/client";
import type { EventDTO } from "@/lib/events";
import { formatEventDate, formatPrice } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import { EventImage } from "@/components/EventImage";
import { EmptyState, ErrorState, Spinner } from "@/components/States";

export default function AdminEventsPage() {
  const { data, error, loading, retry, setData } = useApi<{ events: EventDTO[] }>("/api/admin/events");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setActive(event: EventDTO, isActive: boolean) {
    setBusyId(event.id);
    try {
      const res = await api<{ event: EventDTO }>(`/api/admin/events/${event.id}`, { method: "PATCH", json: { isActive } });
      setData((d) => d && { events: d.events.map((e) => (e.id === event.id ? res.event : e)) });
      toast.success(`"${event.title}" is now ${isActive ? "active" : "inactive"}.`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const now = new Date();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Events</h1>
          <p className="text-sm text-slate-600">Inactive events are hidden from visitors. Events are never deleted.</p>
        </div>
        <Link href="/admin/events/new" className="btn-primary">+ Add event</Link>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : loading || !data ? (
        <div className="grid place-items-center py-20 text-indigo-600"><Spinner className="size-6" /></div>
      ) : data.events.length === 0 ? (
        <EmptyState emoji="📭" title="No events yet" message="Add your first event to get started." action={{ label: "Add event", href: "/admin/events/new" }} />
      ) : (
        <ul className="space-y-3">
          {data.events.map((e) => {
            const past = new Date(e.startsAt) < now;
            return (
              <li key={e.id} className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                <EventImage src={e.imageUrl} alt="" category={e.category} className="h-36 w-full rounded-xl sm:h-16 sm:w-24" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold text-slate-900">{e.title}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                      {e.isActive ? "Active" : "Inactive"}
                    </span>
                    {past && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Past</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {e.category} · {e.city} · {formatEventDate(e.startsAt)} · {formatPrice(e.price)}
                  </p>
                </div>
                <button
                  className={e.isActive ? "btn-secondary" : "btn-primary"}
                  disabled={busyId === e.id}
                  onClick={() => setActive(e, !e.isActive)}
                >
                  {busyId === e.id && <Spinner />}
                  {e.isActive ? "Make inactive" : "Make active"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

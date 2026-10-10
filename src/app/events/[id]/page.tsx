"use client";

import { use } from "react";
import Link from "next/link";
import type { EventDTO } from "@/lib/events";
import { formatEventDate, formatPrice } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import { CardDesigner } from "@/components/CardDesigner";
import { CategoryChip } from "@/components/EventCard";
import { EventImage } from "@/components/EventImage";
import { RemindButton } from "@/components/RemindButton";
import { EmptyState, ErrorState } from "@/components/States";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading, retry } = useApi<{ event: EventDTO }>(`/api/events/${id}`);

  if (loading) return <DetailSkeleton />;
  if (error === "Event not found.") {
    return (
      <EmptyState
        emoji="🎟️"
        title="Event not found"
        message="It may have been removed or is no longer active."
        action={{ label: "Browse events", href: "/" }}
      />
    );
  }
  if (error || !data) return <ErrorState message={error ?? "Unknown error"} onRetry={retry} />;

  const { event } = data;
  const isPast = new Date(event.startsAt) < new Date();

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600">
        ← All events
      </Link>

      <article className="card overflow-hidden md:grid md:grid-cols-2">
        <EventImage src={event.imageUrl} alt={event.title} category={event.category} className="aspect-[16/10] h-full w-full md:aspect-auto" />
        <div className="flex flex-col gap-4 p-5 sm:p-7">
          <CategoryChip category={event.category} />
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{event.title}</h1>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
            <dt>🗓️</dt>
            <dd className="font-medium text-slate-800">{formatEventDate(event.startsAt)}</dd>
            <dt>📍</dt>
            <dd className="font-medium text-slate-800">{event.city}</dd>
            <dt>🎟️</dt>
            <dd className="font-bold text-slate-900">{formatPrice(event.price)}</dd>
          </dl>
          <p className="whitespace-pre-line leading-relaxed text-slate-600">{event.description}</p>
          <div className="mt-auto">
            {isPast ? (
              <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">This event has already happened.</p>
            ) : (
              <RemindButton eventId={event.id} size="lg" />
            )}
          </div>
        </div>
      </article>

      <CardDesigner event={event} />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="card overflow-hidden md:grid md:grid-cols-2" aria-busy="true">
      <div className="aspect-[16/10] animate-pulse bg-slate-200" />
      <div className="space-y-4 p-7">
        <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-20 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import type { EventDTO, Paginated } from "@/lib/events";
import { useApi } from "@/lib/useApi";
import { EventCard } from "@/components/EventCard";
import { Pagination } from "@/components/Pagination";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/States";

export default function EventsPage() {
  return (
    <Suspense fallback={<CardGridSkeleton />}>
      <Events />
    </Suspense>
  );
}

function Events() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // The URL is the source of truth for filters, so they survive refresh and can be shared.
  const category = params.get("category") ?? "";
  const city = params.get("city") ?? "";
  const q = params.get("q") ?? "";
  const page = Number(params.get("page")) || 1;

  const [search, setSearch] = useState(q);

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    if (!("page" in next)) sp.delete("page"); // any filter change goes back to page 1
    router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false });
  }

  // Debounce typing in the search box.
  useEffect(() => {
    if (search.trim() === q) return;
    const t = setTimeout(() => update({ q: search.trim() }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (city) query.set("city", city);
  if (q) query.set("q", q);
  if (page > 1) query.set("page", String(page));

  const events = useApi<Paginated<EventDTO>>(`/api/events?${query}`);
  const cities = useApi<{ cities: string[] }>("/api/cities");
  const hasFilters = Boolean(category || city || q);

  function clearFilters() {
    setSearch("");
    router.replace(pathname, { scroll: false });
  }

  return (
    <div>
      <section className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          What&apos;s happening near you
        </h1>
        <p className="mt-1 text-slate-600">Music nights, workshops, food fairs and more, nearest date first.</p>
      </section>

      <section className="card mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
        <div>
          <label htmlFor="q" className="label">Search</label>
          <input
            id="q"
            type="search"
            className="input"
            placeholder='Try "night" or "pottery"'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="category" className="label">Category</label>
          <select id="category" className="input sm:w-40" value={category} onChange={(e) => update({ category: e.target.value })}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="city" className="label">City</label>
          <select id="city" className="input sm:w-40" value={city} onChange={(e) => update({ city: e.target.value })}>
            <option value="">All cities</option>
            {city && !cities.data?.cities.includes(city) && <option value={city}>{city}</option>}
            {cities.data?.cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button className="btn-secondary" onClick={clearFilters} disabled={!hasFilters}>
          Clear
        </button>
      </section>

      {events.data && !events.loading && !events.error && (
        <p className="mb-3 text-sm text-slate-500">
          {events.data.total} event{events.data.total === 1 ? "" : "s"} found
        </p>
      )}

      {events.error ? (
        <ErrorState message={events.error} onRetry={events.retry} />
      ) : events.loading || !events.data ? (
        <CardGridSkeleton />
      ) : events.data.items.length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="No events match your filters"
            message="Try a different category, city or search word."
            action={{ label: "Clear filters", onClick: clearFilters }}
          />
        ) : (
          <EmptyState emoji="🗓️" title="No upcoming events yet" message="Check back soon, new events are added every week." />
        )
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.data.items.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
          <Pagination
            page={events.data.page}
            totalPages={events.data.totalPages}
            onChange={(p) => {
              update({ page: p > 1 ? String(p) : "" });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </div>
  );
}

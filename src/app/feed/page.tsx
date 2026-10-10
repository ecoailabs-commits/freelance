"use client";

import { useState } from "react";
import Link from "next/link";
import type { EventDTO, Paginated } from "@/lib/events";
import { CATEGORY_EMOJI, type Category } from "@/lib/constants";
import { useApi } from "@/lib/useApi";
import { EventCard } from "@/components/EventCard";
import { LoginRequired } from "@/components/LoginRequired";
import { Pagination } from "@/components/Pagination";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/States";

export default function FeedPage() {
  return (
    <LoginRequired what="your personal feed">
      <Feed />
    </LoginRequired>
  );
}

function Feed() {
  const [page, setPage] = useState(1);
  const { data, error, loading, retry } = useApi<Paginated<EventDTO> & { categories: string[] }>(
    `/api/me/feed?page=${page}`,
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Feed</h1>
          <p className="mt-1 text-slate-600">Upcoming events from the categories you love.</p>
        </div>
        <Link href="/preferences" className="btn-secondary">Edit interests</Link>
      </div>

      {data && data.categories.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {data.categories.map((c) => (
            <span key={c} className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
              {CATEGORY_EMOJI[c as Category]} {c}
            </span>
          ))}
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : loading || !data ? (
        <CardGridSkeleton />
      ) : data.categories.length === 0 ? (
        <EmptyState
          emoji="✨"
          title="Tell us what you like"
          message="You haven't picked any favourite categories yet. Choose a few and we'll fill this page for you."
          action={{ label: "Pick interests", href: "/preferences" }}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="Nothing coming up in your categories"
          message="No upcoming events match your interests right now. Add more categories or browse everything."
          action={{ label: "Browse all events", href: "/" }}
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

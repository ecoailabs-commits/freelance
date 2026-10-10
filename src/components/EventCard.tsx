import Link from "next/link";
import type { EventDTO } from "@/lib/events";
import { CATEGORY_EMOJI, type Category } from "@/lib/constants";
import { formatEventDate, formatPrice } from "@/lib/format";
import { EventImage } from "./EventImage";
import { RemindButton } from "./RemindButton";

export function CategoryChip({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
      {CATEGORY_EMOJI[category as Category]} {category}
    </span>
  );
}

export function EventCard({ event }: { event: EventDTO }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        <EventImage
          src={event.imageUrl}
          alt={event.title}
          category={event.category}
          className="aspect-[16/10] w-full transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-900 shadow">
          {formatPrice(event.price)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <CategoryChip category={event.category} />
        <h3 className="line-clamp-2 text-base font-bold text-slate-900">{event.title}</h3>
        <p className="text-sm text-slate-600">
          🗓️ {formatEventDate(event.startsAt)}
          <br />
          📍 {event.city}
        </p>
        <div className="mt-auto pt-2">
          <RemindButton eventId={event.id} />
        </div>
      </div>
    </Link>
  );
}

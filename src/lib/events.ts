import type { Event, Prisma } from "@prisma/client";
import { prisma } from "./db";
import { PAGE_SIZE } from "./constants";

/** JSON shape returned by the API for an event. */
export type EventDTO = {
  id: string;
  title: string;
  category: string;
  city: string;
  startsAt: string;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

export function toDTO(e: Event): EventDTO {
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    city: e.city,
    startsAt: e.startsAt.toISOString(),
    price: e.price,
    description: e.description,
    imageUrl: e.imageUrl,
    isActive: e.isActive,
  };
}

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function parsePage(value: string | null): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/**
 * Visitors only ever see active events that have not started yet,
 * nearest first. Extra filters are AND-ed on top.
 */
export async function listUpcoming(
  filters: Prisma.EventWhereInput,
  page: number,
): Promise<Paginated<EventDTO>> {
  const where: Prisma.EventWhereInput = {
    isActive: true,
    startsAt: { gte: new Date() },
    ...filters,
  };
  const [total, rows] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  return {
    items: rows.map(toDTO),
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

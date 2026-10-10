import { handle, ok } from "@/lib/api";
import { prisma } from "@/lib/db";

// GET /api/cities -> cities that currently have upcoming events (for the filter dropdown)
export const GET = handle(async () => {
  const rows = await prisma.event.findMany({
    where: { isActive: true, startsAt: { gte: new Date() } },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  return ok({ cities: rows.map((r) => r.city) });
});

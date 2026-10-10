import type { Prisma } from "@prisma/client";
import { handle, ok } from "@/lib/api";
import { listUpcoming, parsePage } from "@/lib/events";
import { categorySchema } from "@/lib/validation";

// GET /api/events?category=Music&city=Coimbatore&q=night&page=1
export const GET = handle(async (req) => {
  const params = req.nextUrl.searchParams;
  const filters: Prisma.EventWhereInput = {};

  const category = params.get("category");
  if (category) filters.category = categorySchema.parse(category);

  const city = params.get("city")?.trim();
  if (city) filters.city = city;

  const q = params.get("q")?.trim();
  if (q) filters.OR = [{ title: { contains: q } }, { description: { contains: q } }];

  return ok(await listUpcoming(filters, parsePage(params.get("page"))));
});

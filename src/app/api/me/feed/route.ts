import { handle, ok, requireUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { listUpcoming, parsePage } from "@/lib/events";

// GET /api/me/feed?page=1 -> upcoming events in the user's favourite categories
export const GET = handle(async (req) => {
  const userId = await requireUser(req);
  const favourites = await prisma.favouriteCategory.findMany({ where: { userId } });
  const categories = favourites.map((f) => f.category);

  const page = parsePage(req.nextUrl.searchParams.get("page"));
  const result = await listUpcoming({ category: { in: categories } }, page);
  return ok({ ...result, categories });
});

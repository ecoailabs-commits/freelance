import { handle, ok, readJson, requireUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { favouritesSchema } from "@/lib/validation";

// GET /api/me/favourites -> { categories }
export const GET = handle(async (req) => {
  const userId = await requireUser(req);
  const rows = await prisma.favouriteCategory.findMany({ where: { userId } });
  return ok({ categories: rows.map((r) => r.category) });
});

// PUT /api/me/favourites { categories: ["Music", "Food"] } -> replaces the whole list
export const PUT = handle(async (req) => {
  const userId = await requireUser(req);
  const { categories } = favouritesSchema.parse(await readJson(req));
  const unique = [...new Set(categories)];

  await prisma.$transaction([
    prisma.favouriteCategory.deleteMany({ where: { userId } }),
    prisma.favouriteCategory.createMany({
      data: unique.map((category) => ({ userId, category })),
    }),
  ]);
  return ok({ categories: unique });
});

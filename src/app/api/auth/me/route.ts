import { handle, HttpError, ok, requireUser } from "@/lib/api";
import { prisma } from "@/lib/db";

// GET /api/auth/me -> current user (401 if not logged in)
export const GET = handle(async (req) => {
  const userId = await requireUser(req);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { favourites: true },
  });
  if (!user) throw new HttpError(401, "Please log in to continue.");
  return ok({
    user: { id: user.id, email: user.email, favourites: user.favourites.map((f) => f.category) },
  });
});

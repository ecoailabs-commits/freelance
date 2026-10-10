import { handle, HttpError, ok } from "@/lib/api";
import { prisma } from "@/lib/db";
import { toDTO } from "@/lib/events";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/events/:id  (inactive events are hidden from visitors)
export const GET = handle<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event || !event.isActive) throw new HttpError(404, "Event not found.");
  return ok({ event: toDTO(event) });
});

import { handle, ok, readJson, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";
import { toDTO } from "@/lib/events";
import { eventInputSchema } from "@/lib/validation";

// GET /api/admin/events -> every event (active, inactive, past), newest date first
export const GET = handle(async (req) => {
  await requireAdmin(req);
  const events = await prisma.event.findMany({ orderBy: { startsAt: "desc" } });
  return ok({ events: events.map(toDTO) });
});

// POST /api/admin/events { title, category, city, startsAt, price, description, imageUrl, isActive? }
export const POST = handle(async (req) => {
  await requireAdmin(req);
  const data = eventInputSchema.parse(await readJson(req));
  const event = await prisma.event.create({ data });
  return ok({ event: toDTO(event) }, 201);
});

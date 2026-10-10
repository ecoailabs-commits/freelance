import { handle, HttpError, ok, requireUser } from "@/lib/api";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ eventId: string }> };

// PUT /api/me/reminders/:eventId -> turn reminder on (idempotent)
export const PUT = handle<Ctx>(async (req, { params }) => {
  const userId = await requireUser(req);
  const { eventId } = await params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || !event.isActive) throw new HttpError(404, "Event not found.");

  await prisma.reminder.upsert({
    where: { userId_eventId: { userId, eventId } },
    create: { userId, eventId },
    update: {},
  });
  return ok({ eventId, reminded: true });
});

// DELETE /api/me/reminders/:eventId -> turn reminder off (idempotent)
export const DELETE = handle<Ctx>(async (req, { params }) => {
  const userId = await requireUser(req);
  const { eventId } = await params;
  await prisma.reminder.deleteMany({ where: { userId, eventId } });
  return ok({ eventId, reminded: false });
});

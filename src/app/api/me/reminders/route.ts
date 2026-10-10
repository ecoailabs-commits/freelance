import { handle, ok, requireUser } from "@/lib/api";
import { prisma } from "@/lib/db";

// GET /api/me/reminders -> { eventIds } the user asked to be reminded about
export const GET = handle(async (req) => {
  const userId = await requireUser(req);
  const rows = await prisma.reminder.findMany({ where: { userId }, select: { eventId: true } });
  return ok({ eventIds: rows.map((r) => r.eventId) });
});

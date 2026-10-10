import { z } from "zod";
import { handle, HttpError, ok, readJson, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";
import { toDTO } from "@/lib/events";

type Ctx = { params: Promise<{ id: string }> };

const statusSchema = z.object({ isActive: z.boolean({ message: "isActive must be true or false." }) });

// PATCH /api/admin/events/:id { isActive } -> activate / deactivate (events are never deleted)
export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req);
  const { id } = await params;
  const { isActive } = statusSchema.parse(await readJson(req));

  const exists = await prisma.event.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw new HttpError(404, "Event not found.");

  const event = await prisma.event.update({ where: { id }, data: { isActive } });
  return ok({ event: toDTO(event) });
});

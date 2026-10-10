import { handle, HttpError, ok, readJson, requireUser } from "@/lib/api";
import { CARD_THEMES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { cardDesignSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ eventId: string }> };

const DEFAULT_DESIGN = { theme: CARD_THEMES[0].id, stickers: [] as string[] };

// GET /api/me/card-designs/:eventId -> { design: { theme, stickers } } (defaults if never saved)
export const GET = handle<Ctx>(async (req, { params }) => {
  const userId = await requireUser(req);
  const { eventId } = await params;
  const row = await prisma.cardDesign.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  const design = row ? { theme: row.theme, stickers: JSON.parse(row.stickers) } : DEFAULT_DESIGN;
  return ok({ design });
});

// PUT /api/me/card-designs/:eventId { theme, stickers } -> saves the design
export const PUT = handle<Ctx>(async (req, { params }) => {
  const userId = await requireUser(req);
  const { eventId } = await params;
  const design = cardDesignSchema.parse(await readJson(req));

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || !event.isActive) throw new HttpError(404, "Event not found.");

  const data = { theme: design.theme, stickers: JSON.stringify(design.stickers) };
  await prisma.cardDesign.upsert({
    where: { userId_eventId: { userId, eventId } },
    create: { userId, eventId, ...data },
    update: data,
  });
  return ok({ design });
});

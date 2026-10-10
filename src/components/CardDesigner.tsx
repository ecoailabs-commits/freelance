"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { api } from "@/lib/client";
import { CARD_THEMES, MAX_STICKERS, STICKERS, type CardThemeId, type StickerId } from "@/lib/constants";
import type { EventDTO } from "@/lib/events";
import { formatEventDate, formatPrice } from "@/lib/format";
import { useAuth } from "./AuthProvider";
import { Spinner } from "./States";

type Design = { theme: CardThemeId; stickers: StickerId[] };
type PlacedSticker = { key: number; id: StickerId };
type SaveStatus = "idle" | "saving" | "saved" | "error";

// Where stickers 1, 2 and 3 sit on the card (top area, clear of the text).
const SLOTS = [
  "right-4 top-4 rotate-12",
  "left-4 top-4 -rotate-12",
  "left-1/2 top-8 -translate-x-1/2 rotate-6",
];
const emojiOf = (id: StickerId) => STICKERS.find((s) => s.id === id)!.emoji;

let nextKey = 1;
const place = (ids: StickerId[]): PlacedSticker[] => ids.map((id) => ({ key: nextKey++, id }));

export function CardDesigner({ event }: { event: EventDTO }) {
  const { user, loading: authLoading } = useAuth();
  const [theme, setTheme] = useState<CardThemeId>(CARD_THEMES[0].id);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveAttempt, setSaveAttempt] = useState(0);
  const dirty = useRef(false);

  // Load the saved design once we know who the user is.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoaded(true);
      return;
    }
    api<{ design: Design }>(`/api/me/card-designs/${event.id}`)
      .then(({ design }) => {
        setTheme(design.theme);
        setStickers(place(design.stickers));
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoaded(true));
  }, [authLoading, user, event.id]);

  // Auto-save shortly after the last change.
  const design: Design = { theme, stickers: stickers.map((s) => s.id) };
  const designKey = JSON.stringify(design);
  useEffect(() => {
    if (!dirty.current || !user) return;
    setStatus("saving");
    const t = setTimeout(() => {
      api(`/api/me/card-designs/${event.id}`, { method: "PUT", json: JSON.parse(designKey) })
        .then(() => setStatus("saved"))
        .catch(() => setStatus("error"));
    }, 500);
    return () => clearTimeout(t);
  }, [designKey, saveAttempt, user, event.id]);

  function change(fn: () => void) {
    dirty.current = true;
    fn();
  }

  const full = stickers.length >= MAX_STICKERS;
  // Controls stay disabled until the saved design has loaded, so an early tap can't be overwritten.
  const themeClass = CARD_THEMES.find((t) => t.id === theme)!.className;

  return (
    <section className="card p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Design your card</h2>
          <p className="text-sm text-slate-600">Pick a theme and add up to {MAX_STICKERS} stickers. Tap a sticker on the card to remove it.</p>
        </div>
        <SaveBadge status={status} loggedIn={!!user} onRetry={() => setSaveAttempt((n) => n + 1)} />
      </div>

      {loadError && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Couldn&apos;t load your saved card: {loadError}
        </p>
      )}

      <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
        {/* Live preview */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
          <AnimatePresence initial={false}>
            <motion.div
              key={theme}
              className={`absolute inset-0 bg-gradient-to-br ${themeClass}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            />
          </AnimatePresence>
          {!loaded && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/10 text-white">
              <Spinner className="size-6" />
            </div>
          )}
          <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white sm:p-7">
            <span className="mb-2 w-fit rounded-full bg-white/25 px-3 py-1 text-xs font-semibold backdrop-blur">
              {event.category} · {event.city}
            </span>
            <h3 className="text-2xl font-extrabold leading-tight drop-shadow sm:text-3xl">{event.title}</h3>
            <p className="mt-1 text-sm font-medium text-white/90">
              {formatEventDate(event.startsAt)} · {formatPrice(event.price)}
            </p>
          </div>
          <AnimatePresence>
            {stickers.map((s, i) => (
              <motion.button
                key={s.key}
                type="button"
                layout
                aria-label={`Remove ${s.id} sticker`}
                onClick={() => change(() => setStickers((all) => all.filter((x) => x.key !== s.key)))}
                className={`absolute z-10 text-4xl drop-shadow-lg sm:text-5xl ${SLOTS[i]}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
              >
                {emojiOf(s.id)}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          <div>
            <h4 className="label">Theme</h4>
            <div className="flex gap-3">
              {CARD_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={!loaded}
                  onClick={() => change(() => setTheme(t.id))}
                  aria-pressed={theme === t.id}
                  className="flex flex-col items-center gap-1 text-xs font-medium text-slate-600 disabled:opacity-50"
                >
                  <span
                    className={`size-12 rounded-full bg-gradient-to-br ${t.className} transition ${
                      theme === t.id ? "ring-4 ring-indigo-500 ring-offset-2" : "opacity-80 hover:opacity-100"
                    }`}
                  />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="label">
              Stickers <span className="font-normal text-slate-500">({stickers.length}/{MAX_STICKERS})</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {STICKERS.map((s) => (
                <motion.button
                  key={s.id}
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  disabled={full || !loaded}
                  onClick={() => change(() => setStickers((all) => (all.length >= MAX_STICKERS ? all : [...all, ...place([s.id])])))}
                  aria-label={`Add ${s.id} sticker`}
                  className="grid size-12 place-items-center rounded-xl border border-slate-200 bg-white text-2xl shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {s.emoji}
                </motion.button>
              ))}
            </div>
            <p className="mt-2 min-h-5 text-xs text-slate-500">
              {full ? "Card is full. Tap a sticker on the card to remove it." : "Tap a sticker to add it."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SaveBadge({ status, loggedIn, onRetry }: { status: SaveStatus; loggedIn: boolean; onRetry: () => void }) {
  const pathname = usePathname();
  if (!loggedIn) {
    return (
      <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="text-sm font-semibold text-indigo-600 hover:underline">
        Log in to save your card →
      </Link>
    );
  }
  if (status === "saving") return <span className="flex items-center gap-2 text-sm text-slate-500"><Spinner /> Saving…</span>;
  if (status === "saved") return <span className="text-sm font-medium text-emerald-600">✓ Saved</span>;
  if (status === "error")
    return (
      <button onClick={onRetry} className="text-sm font-medium text-red-600 hover:underline">
        Couldn&apos;t save. Retry
      </button>
    );
  return null;
}

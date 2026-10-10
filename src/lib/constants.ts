export const CATEGORIES = ["Music", "Workshop", "Food", "Sports", "Kids"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_EMOJI: Record<Category, string> = {
  Music: "🎵",
  Workshop: "🛠️",
  Food: "🍲",
  Sports: "⚽",
  Kids: "🧸",
};

export const CARD_THEMES = [
  { id: "sunset", name: "Sunset", className: "from-orange-400 via-rose-500 to-fuchsia-600" },
  { id: "ocean", name: "Ocean", className: "from-cyan-400 via-sky-500 to-indigo-600" },
  { id: "forest", name: "Forest", className: "from-lime-400 via-emerald-500 to-teal-700" },
] as const;
export type CardThemeId = (typeof CARD_THEMES)[number]["id"];

export const STICKERS = [
  { id: "star", emoji: "⭐" },
  { id: "party", emoji: "🎉" },
  { id: "heart", emoji: "❤️" },
  { id: "fire", emoji: "🔥" },
  { id: "music", emoji: "🎶" },
] as const;
export type StickerId = (typeof STICKERS)[number]["id"];

export const MAX_STICKERS = 3;
export const PAGE_SIZE = 6;

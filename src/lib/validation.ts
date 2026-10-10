import { z } from "zod";
import { CARD_THEMES, CATEGORIES, MAX_STICKERS, STICKERS } from "./constants";

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Enter your email."),
  password: z.string().min(1, "Enter your password."),
});

export const categorySchema = z.enum(CATEGORIES, { message: "Unknown category." });

export const eventInputSchema = z.object({
  title: z.string().trim().min(3, "Title is too short.").max(120),
  category: categorySchema,
  city: z.string().trim().min(2, "City is required.").max(60),
  startsAt: z.coerce.date({ message: "Date and time are required." }),
  price: z.coerce.number().int("Price must be whole rupees.").min(0, "Price cannot be negative."),
  description: z.string().trim().min(10, "Description is too short.").max(2000),
  imageUrl: z.string().trim().url("Image URL must be a valid URL."),
  isActive: z.boolean().default(true),
});

export const favouritesSchema = z.object({
  categories: z.array(categorySchema).max(CATEGORIES.length),
});

const themeIds = CARD_THEMES.map((t) => t.id) as [string, ...string[]];
const stickerIds = STICKERS.map((s) => s.id) as [string, ...string[]];

export const cardDesignSchema = z.object({
  theme: z.enum(themeIds, { message: "Unknown theme." }),
  stickers: z
    .array(z.enum(stickerIds, { message: "Unknown sticker." }))
    .max(MAX_STICKERS, `You can add up to ${MAX_STICKERS} stickers.`),
});

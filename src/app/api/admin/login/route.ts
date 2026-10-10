import { createHash, timingSafeEqual } from "node:crypto";
import { handle, HttpError, ok, readJson, setAuthCookie } from "@/lib/api";
import { ADMIN_COOKIE, signToken } from "@/lib/jwt";
import { loginSchema } from "@/lib/validation";

// Compare hashes so the check takes the same time regardless of input length.
function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

// POST /api/admin/login { email, password } -> { token }
export const POST = handle(async (req) => {
  const { email, password } = loginSchema.parse(await readJson(req));
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  const valid = adminPassword !== "" && safeEqual(email, adminEmail) && safeEqual(password, adminPassword);
  if (!valid) throw new HttpError(401, "Email or password is incorrect.");

  const token = await signToken({ sub: "admin", role: "admin" });
  const res = ok({ token });
  setAuthCookie(res, ADMIN_COOKIE, token);
  return res;
});

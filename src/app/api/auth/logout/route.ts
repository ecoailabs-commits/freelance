import { clearAuthCookie, ok } from "@/lib/api";
import { USER_COOKIE } from "@/lib/jwt";

// POST /api/auth/logout (web only; mobile clients just drop the token)
export async function POST() {
  const res = ok({ ok: true });
  clearAuthCookie(res, USER_COOKIE);
  return res;
}

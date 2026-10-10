import { clearAuthCookie, ok } from "@/lib/api";
import { ADMIN_COOKIE } from "@/lib/jwt";

// POST /api/admin/logout
export async function POST() {
  const res = ok({ ok: true });
  clearAuthCookie(res, ADMIN_COOKIE);
  return res;
}

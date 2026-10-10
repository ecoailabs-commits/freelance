import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyToken } from "@/lib/jwt";

const PUBLIC_PATHS = new Set(["/admin/login", "/api/admin/login", "/api/admin/logout"]);

/**
 * First line of defence for the admin area. Runs on the server before any
 * admin page or admin API is reached. (Every admin API handler also calls
 * requireAdmin itself, so a bug here alone cannot expose them.)
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const bearer = req.headers.get("authorization")?.replace(/^Bearer /, "");
  const payload = await verifyToken(bearer ?? req.cookies.get(ADMIN_COOKIE)?.value);
  if (payload?.role === "admin") return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }
  const url = new URL("/admin/login", req.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

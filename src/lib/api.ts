import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  ADMIN_COOKIE,
  TOKEN_TTL_SECONDS,
  USER_COOKIE,
  verifyToken,
  type Role,
} from "./jwt";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Thrown inside handlers; turned into a JSON error by `handle`. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Reads the token from `Authorization: Bearer <jwt>` (mobile apps)
 * or from the httpOnly cookie (web pages).
 */
async function authenticate(req: NextRequest, role: Role) {
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const cookie = req.cookies.get(role === "admin" ? ADMIN_COOKIE : USER_COOKIE)?.value;
  const payload = await verifyToken(bearer ?? cookie);
  return payload?.role === role ? payload : null;
}

export async function optionalUser(req: NextRequest) {
  return (await authenticate(req, "user"))?.sub ?? null;
}

export async function requireUser(req: NextRequest): Promise<string> {
  const userId = await optionalUser(req);
  if (!userId) throw new HttpError(401, "Please log in to continue.");
  return userId;
}

export async function requireAdmin(req: NextRequest): Promise<void> {
  if (!(await authenticate(req, "admin"))) throw new HttpError(401, "Admin login required.");
}

export function setAuthCookie(res: NextResponse, name: string, token: string) {
  res.cookies.set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  });
}

export function clearAuthCookie(res: NextResponse, name: string) {
  res.cookies.set(name, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

/** Wraps a route handler so thrown errors become consistent JSON responses. */
export function handle<C>(fn: (req: NextRequest, ctx: C) => Promise<Response>) {
  return async (req: NextRequest, ctx: C) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) return fail(e.message, e.status);
      if (e instanceof ZodError) return fail(e.issues[0]?.message ?? "Invalid input.", 400);
      console.error(e);
      return fail("Something went wrong. Please try again.", 500);
    }
  };
}

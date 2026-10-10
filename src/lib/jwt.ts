// Edge-safe JWT helpers (used by both middleware and route handlers).
import { SignJWT, jwtVerify } from "jose";

export type Role = "user" | "admin";
export type TokenPayload = { sub: string; role: Role };

export const USER_COOKIE = "token";
export const ADMIN_COOKIE = "admin_token";
export const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(secret());
}

export async function verifyToken(token: string | undefined): Promise<TokenPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;
    if (payload.role !== "user" && payload.role !== "admin") return null;
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

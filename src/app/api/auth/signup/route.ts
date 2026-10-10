import bcrypt from "bcryptjs";
import { handle, HttpError, ok, readJson, setAuthCookie } from "@/lib/api";
import { prisma } from "@/lib/db";
import { signToken, USER_COOKIE } from "@/lib/jwt";
import { credentialsSchema } from "@/lib/validation";

// POST /api/auth/signup { email, password } -> { token, user }
export const POST = handle(async (req) => {
  const { email, password } = credentialsSchema.parse(await readJson(req));

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new HttpError(409, "An account with this email already exists.");

  const user = await prisma.user.create({
    data: { email, passwordHash: await bcrypt.hash(password, 12) },
  });

  const token = await signToken({ sub: user.id, role: "user" });
  const res = ok({ token, user: { id: user.id, email: user.email, favourites: [] } }, 201);
  setAuthCookie(res, USER_COOKIE, token);
  return res;
});

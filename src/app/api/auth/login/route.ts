import bcrypt from "bcryptjs";
import { handle, HttpError, ok, readJson, setAuthCookie } from "@/lib/api";
import { prisma } from "@/lib/db";
import { signToken, USER_COOKIE } from "@/lib/jwt";
import { loginSchema } from "@/lib/validation";

// POST /api/auth/login { email, password } -> { token, user }
export const POST = handle(async (req) => {
  const { email, password } = loginSchema.parse(await readJson(req));

  const user = await prisma.user.findUnique({
    where: { email },
    include: { favourites: true },
  });
  // Same message for unknown email and wrong password.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, "Email or password is incorrect.");
  }

  const token = await signToken({ sub: user.id, role: "user" });
  const res = ok({
    token,
    user: { id: user.id, email: user.email, favourites: user.favourites.map((f) => f.category) },
  });
  setAuthCookie(res, USER_COOKIE, token);
  return res;
});

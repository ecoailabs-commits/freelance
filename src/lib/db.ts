import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

// Locally: the SQLite file from DATABASE_URL.
// Hosted (Netlify has no writable disk): Turso, a hosted SQLite, when TURSO_DATABASE_URL is set.
function createClient() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return new PrismaClient();
  return new PrismaClient({
    adapter: new PrismaLibSQL({ url, authToken: process.env.TURSO_AUTH_TOKEN }),
  });
}

// Reuse one client across hot reloads in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

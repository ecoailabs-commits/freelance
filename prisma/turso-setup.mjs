// Runs during the Netlify build. Creates the tables in the Turso database the
// first time, then seeds the sample events only if there are none yet.
import { execSync } from "node:child_process";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error("TURSO_DATABASE_URL is not set. Add it (and TURSO_AUTH_TOKEN) in Netlify > Site configuration > Environment variables.");
  process.exit(1);
}

const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

const { rows } = await db.execute("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Event'");
if (rows.length === 0) {
  const sql = execSync("npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script", {
    encoding: "utf8",
  });
  await db.executeMultiple(sql);
  console.log("Created tables in Turso.");
} else {
  console.log("Tables already exist.");
}
db.close();

execSync("node prisma/seed.mjs --if-empty", { stdio: "inherit" });

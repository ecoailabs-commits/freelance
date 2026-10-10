import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // libSQL ships native binaries; load it from node_modules at runtime instead of bundling it.
  serverExternalPackages: ["@prisma/adapter-libsql", "@libsql/client", "libsql"],
};

export default nextConfig;

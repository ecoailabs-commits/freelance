import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyToken } from "@/lib/jwt";
import { AdminLogoutButton } from "./AdminLogoutButton";

// Server-side check (in addition to middleware) before any admin page renders.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const payload = await verifyToken(token);
  if (payload?.role !== "admin") redirect("/admin/login");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white">
        <Link href="/admin" className="flex items-center gap-2 font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-500">🎪</span>
          Admin · Community Events
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white">View site</Link>
          <AdminLogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}

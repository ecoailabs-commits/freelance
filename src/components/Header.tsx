"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null; // admin area has its own header

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">🎪</span>
          <span className="hidden sm:inline">Community Events</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/">Events</NavLink>
          <NavLink href="/feed">My Feed</NavLink>
          {loading ? (
            <span className="h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
          ) : user ? (
            <>
              <NavLink href="/preferences">Interests</NavLink>
              <button onClick={logout} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary ml-1 px-3 py-2">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

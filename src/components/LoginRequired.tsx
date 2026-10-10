"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { EmptyState, Spinner } from "./States";

/** Renders children only for logged-in users; otherwise a friendly prompt. */
export function LoginRequired({ children, what }: { children: React.ReactNode; what: string }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="grid place-items-center py-20 text-indigo-600">
        <Spinner className="size-6" />
      </div>
    );
  }
  if (!user) {
    return (
      <EmptyState
        emoji="🔐"
        title="Please log in"
        message={`Log in or create a free account to see ${what}.`}
        action={{ label: "Log in", href: `/login?next=${encodeURIComponent(pathname)}` }}
      />
    );
  }
  return <>{children}</>;
}

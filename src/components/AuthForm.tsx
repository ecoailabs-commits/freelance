"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { useAuth, type User } from "./AuthProvider";
import { Spinner } from "./States";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const next = params.get("next");
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { user } = await api<{ token: string; user: User }>(`/api/auth/${mode}`, {
        method: "POST",
        json: { email, password },
      });
      setUser(user);
      toast.success(mode === "signup" ? "Welcome! Pick the events you love." : "Welcome back!");
      // New users (or anyone without favourites) pick categories first.
      if (user.favourites.length === 0) {
        router.push(`/preferences${safeNext ? `?next=${encodeURIComponent(safeNext)}` : ""}`);
      } else {
        router.push(safeNext ?? "/feed");
      }
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  const isLogin = mode === "login";
  const otherHref = `${isLogin ? "/signup" : "/login"}${safeNext ? `?next=${encodeURIComponent(safeNext)}` : ""}`;

  return (
    <div className="mx-auto max-w-sm">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-slate-900">{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {isLogin ? "Log in to see your feed and reminders." : "Get a feed of events you'll actually like."}
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" autoComplete="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={8}
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>}
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting && <Spinner />}
            {isLogin ? "Log in" : "Sign up"}
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-slate-600">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link href={otherHref} className="font-semibold text-indigo-600 hover:underline">
          {isLogin ? "Create an account" : "Log in"}
        </Link>
      </p>
    </div>
  );
}

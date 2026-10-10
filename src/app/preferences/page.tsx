"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { CATEGORIES, CATEGORY_EMOJI } from "@/lib/constants";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/components/AuthProvider";
import { LoginRequired } from "@/components/LoginRequired";
import { ErrorState, Spinner } from "@/components/States";

export default function PreferencesPage() {
  return (
    <LoginRequired what="your interests">
      <Suspense>
        <Preferences />
      </Suspense>
    </LoginRequired>
  );
}

function Preferences() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, setUser } = useAuth();
  const { data, error, loading, retry } = useApi<{ categories: string[] }>("/api/me/favourites");
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setSelected(data.categories);
  }, [data]);

  const toggle = (c: string) => setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  async function save() {
    setSaving(true);
    try {
      const res = await api<{ categories: string[] }>("/api/me/favourites", { method: "PUT", json: { categories: selected } });
      if (user) setUser({ ...user, favourites: res.categories });
      toast.success("Interests saved.");
      const next = params.get("next");
      router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/feed");
    } catch (e) {
      toast.error((e as Error).message);
      setSaving(false);
    }
  }

  if (error) return <ErrorState message={error} onRetry={retry} />;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">What are you into?</h1>
      <p className="mt-1 text-slate-600">Pick your favourite categories. Your feed will show upcoming events from these.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATEGORIES.map((c) => {
          const on = selected.includes(c);
          return (
            <button
              key={c}
              type="button"
              aria-pressed={on}
              disabled={loading}
              onClick={() => toggle(c)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 font-semibold transition active:scale-95 disabled:opacity-50 ${
                on ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className="text-3xl">{CATEGORY_EMOJI[c]}</span>
              {c}
              <span className="text-xs font-medium">{on ? "✓ Selected" : "Tap to add"}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500">{selected.length} selected</span>
        <button className="btn-primary" onClick={save} disabled={saving || loading || selected.length === 0}>
          {saving && <Spinner />}
          Save and see my feed
        </button>
      </div>
    </div>
  );
}

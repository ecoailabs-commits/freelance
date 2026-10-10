"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { CATEGORIES } from "@/lib/constants";
import { formatEventDate, formatPrice } from "@/lib/format";
import { Spinner } from "@/components/States";

const EMPTY = {
  title: "",
  category: "Music",
  city: "",
  startsAt: "",
  price: "0",
  description: "",
  imageUrl: "",
  isActive: true,
};

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) => setForm((f) => ({ ...f, [key]: value }));

  // The admin enters local India time; send it with the +05:30 offset.
  const startsAtIso = form.startsAt ? `${form.startsAt}:00+05:30` : "";
  const priceNumber = Number(form.price);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api("/api/admin/events", {
        method: "POST",
        json: { ...form, startsAt: startsAtIso, price: priceNumber },
      });
      toast.success("Event created.");
      router.push("/admin");
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-indigo-600">← Back to events</Link>
      <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Add an event</h1>

      <form onSubmit={onSubmit} className="card mt-5 grid gap-4 p-5 sm:grid-cols-2 sm:p-7" noValidate>
        <div className="sm:col-span-2">
          <label htmlFor="title" className="label">Title</label>
          <input id="title" className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Retro Night Live" />
        </div>
        <div>
          <label htmlFor="category" className="label">Category</label>
          <select id="category" className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="city" className="label">City</label>
          <input id="city" className="input" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Coimbatore" />
        </div>
        <div>
          <label htmlFor="startsAt" className="label">Date and time (IST)</label>
          <input id="startsAt" type="datetime-local" className="input" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
          {startsAtIso && <p className="mt-1 text-xs text-slate-500">Shows as: {formatEventDate(startsAtIso)}</p>}
        </div>
        <div>
          <label htmlFor="price" className="label">Price (₹, 0 for free)</label>
          <input id="price" type="number" min={0} step={1} inputMode="numeric" className="input" value={form.price} onChange={(e) => set("price", e.target.value)} />
          {form.price !== "" && Number.isInteger(priceNumber) && priceNumber >= 0 && (
            <p className="mt-1 text-xs text-slate-500">Shows as: {formatPrice(priceNumber)}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="imageUrl" className="label">Image URL</label>
          <input id="imageUrl" type="url" className="input" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="label">Description</label>
          <textarea id="description" rows={4} className="input" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
          <input type="checkbox" className="size-4 accent-indigo-600" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
          Active (visible to visitors)
        </label>

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p>}

        <div className="flex justify-end gap-3 sm:col-span-2">
          <Link href="/admin" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting && <Spinner />}
            Create event
          </button>
        </div>
      </form>
    </div>
  );
}

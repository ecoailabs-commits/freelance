"use client";

import { useState } from "react";
import { CATEGORY_EMOJI, type Category } from "@/lib/constants";

/** Plain <img> (admin can paste any URL) with a friendly fallback if it fails to load. */
export function EventImage({
  src,
  alt,
  category,
  className = "",
}: {
  src: string;
  alt: string;
  category: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-indigo-100 to-amber-100 text-5xl ${className}`}>
        {CATEGORY_EMOJI[category as Category] ?? "🎪"}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`bg-slate-100 object-cover ${className}`} />
  );
}

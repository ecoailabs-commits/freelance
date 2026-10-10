"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

export function AdminLogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await api("/api/admin/logout", { method: "POST" }).catch(() => {});
        router.replace("/admin/login");
        router.refresh();
      }}
      className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white"
    >
      Log out
    </button>
  );
}

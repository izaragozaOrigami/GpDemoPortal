"use client";

import { useRouter } from "next/navigation";
import { asset } from "@/lib/asset";
import { GPLogo, Ico } from "@/components/buzon/ui";
import { shortUid } from "@/lib/buzon/format";
import type { SessionUser } from "@/lib/buzon/auth";

export default function PortalHeader({ user }: { user: SessionUser }) {
  const router = useRouter();
  const label = user.name || `Usuario · ${shortUid(user.id)}`;

  async function logout() {
    try {
      await fetch(asset("/api/auth/logout"), { method: "POST", credentials: "include" });
    } finally {
      router.push("/login");
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/10 bg-slate-950/80 px-6 py-3 backdrop-blur">
      <GPLogo height={24} tagline={false} />
      <div className="flex items-center gap-3">
        <span className="gp-userpill">
          <span className="ava">{Ico.user({ s: 15 })}</span>
          {label}
        </span>
        <button className="gp-btn-ghost" onClick={logout}>
          {Ico.logout({ s: 16 })} Salir
        </button>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { asset } from "@/lib/asset";
import { GPLogo } from "@/components/buzon/ui";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await fetch(asset("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data?.error || "No se pudo iniciar sesión");
        return;
      }
      router.push("/");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="gp-scope login-wrap">
      <div className="login-bg">
        <div
          className="login-bg-photo"
          style={{ backgroundImage: `url('${asset("/background-login.webp")}')` }}
        />
        <div className="login-bg-fallback" />
        <div className="login-scrim" />
      </div>

      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 18, color: "#6E6E73", marginBottom: 14 }}>
            Bienvenido a
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GPLogo height={34} light />
          </div>
        </div>

        <form onSubmit={onSubmit}>
          {error && <div className="login-error">{error}</div>}

          <label className="login-field">
            <span>Usuario:</span>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Email o nombre de usuario"
              autoComplete="username"
            />
          </label>

          <label className="login-field">
            <span>Contraseña:</span>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Contraseña"
              autoComplete="current-password"
            />
          </label>

          <div style={{ textAlign: "right", margin: "10px 0 22px" }}>
            <a href="#" className="login-forgot" onClick={(e) => e.preventDefault()}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className="gp-btn block" disabled={busy}>
            {busy ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

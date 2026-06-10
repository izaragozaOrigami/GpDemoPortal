import { NextRequest, NextResponse } from "next/server";
import {
  NAME_COOKIE,
  SESSION_COOKIE,
  UID_COOKIE,
  userIdFromToken,
} from "@/lib/buzon/auth";

export const runtime = "nodejs";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 8, // 8 h
};

function extractToken(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const t = d.token ?? d.access_token ?? d.accessToken ?? d.jwt;
    if (typeof t === "string") return t;
  }
  return null;
}

// Nombre para mostrar (viene en la respuesta del login, no en el token).
function extractName(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const full = d.fullname ?? d.fullName ?? d.full_name;
  if (typeof full === "string" && full.trim()) return full.trim();
  const fn = typeof d.firstName === "string" ? d.firstName : "";
  const ln = typeof d.lastName === "string" ? d.lastName : "";
  const composed = `${fn} ${ln}`.trim();
  if (composed) return composed;
  if (typeof d.userName === "string" && d.userName.trim()) return d.userName.trim();
  return null;
}

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json(
      { error: "Usuario y contraseña son obligatorios" },
      { status: 400 }
    );
  }

  // El acceso "demo" (abrir sesión SIN validar contra el userservice) jamás
  // debe quedar habilitado en producción: permitiría entrar sin credenciales
  // reales. Por defecto sólo se activa fuera de producción. Para una demo
  // pública en prod hay que habilitarlo EXPLÍCITAMENTE con ALLOW_DEMO_LOGIN=true.
  const allowDemoLogin =
    process.env.ALLOW_DEMO_LOGIN === "true" ||
    process.env.NODE_ENV !== "production";

  const userserviceUrl = process.env.USERSERVICE_URL;

  // --- MODO REAL: contra Origami.Identity ---
  // Si el servicio responde y rechaza las credenciales → 401 (no hay fallback).
  // Si el servicio está caído/inalcanzable → se cae al MODO DEV de abajo.
  if (userserviceUrl) {
    try {
      const r = await fetch(`${userserviceUrl}Accounts/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, grant_type: "password" }),
      });
      if (r.ok) {
        const data = await r.json().catch(() => null);
        const token = extractToken(data);
        if (token) {
          const userId = userIdFromToken(token);
          const name = extractName(data);
          const res = NextResponse.json({ ok: true, userId, name });
          res.cookies.set(SESSION_COOKIE, token, COOKIE_OPTS);
          if (name) {
            res.cookies.set(NAME_COOKIE, encodeURIComponent(name), COOKIE_OPTS);
          }
          return res;
        }
        // 200 SIN token = Origami.Identity envuelve el error en el body
        // (p.ej. {"status":401,"title":"Unauthorized"}) → credenciales inválidas.
        return NextResponse.json(
          { error: "Usuario o contraseña incorrectos" },
          { status: 401 }
        );
      }
      // Cualquier no-2xx (incl. 500 con usuario inexistente) = credenciales malas.
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    } catch {
      // userservice INALCANZABLE (red/DNS/timeout).
      if (!allowDemoLogin) {
        // En producción fallamos CERRADO: no abrimos sesión sin validar.
        return NextResponse.json(
          { error: "Servicio de autenticación no disponible. Intenta más tarde." },
          { status: 503 }
        );
      }
      console.warn("[login] userservice inalcanzable; usando fallback DEV");
    }
  }

  // --- MODO DEV / fallback: sin userservice o servicio caído ---
  // Cerrado en producción salvo ALLOW_DEMO_LOGIN explícito: nunca se entra
  // sin pasar por el userservice real.
  if (!allowDemoLogin) {
    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos" },
      { status: 401 }
    );
  }
  const devUid = process.env.DEMO_USER_ID;
  if (!devUid) {
    return NextResponse.json(
      { error: "USERSERVICE_URL no configurado y no hay DEMO_USER_ID" },
      { status: 500 }
    );
  }
  // Si hay credenciales demo configuradas, se VALIDAN (rechaza si no coinciden).
  const devUser = process.env.DEMO_USERNAME;
  const devPass = process.env.DEMO_PASSWORD;
  if (devUser && devPass) {
    if (username.trim().toLowerCase() !== devUser.trim().toLowerCase() || password !== devPass) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }
  }
  const res = NextResponse.json({ ok: true, userId: devUid, dev: true });
  res.cookies.set(UID_COOKIE, devUid, COOKIE_OPTS);
  return res;
}

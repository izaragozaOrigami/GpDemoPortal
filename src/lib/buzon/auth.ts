import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Claims estándar de Origami.Identity.
const NAMEID =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const EMAIL =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

export const SESSION_COOKIE = "demo_session"; // JWT real (modo userservice)
export const UID_COOKIE = "demo_uid"; // GUID directo (modo DEV)
export const NAME_COOKIE = "demo_name"; // nombre completo (de la respuesta del login)

export type SessionUser = { id: string; name?: string; email?: string };

/** Decodifica (y verifica la firma si hay llave) el JWT de Origami.Identity. */
function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const key = process.env.JWT_SIGNING_KEY;
    const payload = key
      ? jwt.verify(token, key, {
          algorithms: ["HS256"],
          issuer: process.env.JWT_ISSUER || undefined,
          audience: process.env.JWT_AUDIENCE || undefined,
        })
      : jwt.decode(token); // DEV: sin llave no se verifica la firma.
    return payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** Extrae el userId (GUID) de un JWT de Origami.Identity. */
export function userIdFromToken(token: string): string | null {
  const p = decodeToken(token);
  if (!p) return null;
  const id = p[NAMEID] ?? p["nameid"] ?? p["sub"];
  return id ? String(id).toLowerCase() : null;
}

/** Usuario de la sesión (id + nombre + email). null si no hay sesión. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const c = await cookies();
  const fullName = c.get(NAME_COOKIE)?.value;
  const decodedName = fullName ? decodeURIComponent(fullName) : undefined;
  const token = c.get(SESSION_COOKIE)?.value;
  if (token) {
    const p = decodeToken(token);
    const id = p?.[NAMEID] ?? p?.["nameid"] ?? p?.["sub"];
    if (id) {
      return {
        id: String(id).toLowerCase(),
        // Preferir el nombre completo (cookie); si no, el claim name del token.
        name: decodedName || (p?.[NAME] as string) || undefined,
        email: (p?.[EMAIL] as string) || undefined,
      };
    }
  }
  const uid = c.get(UID_COOKIE)?.value;
  if (uid) return { id: uid.toLowerCase(), name: "Usuario demo" };
  return null;
}

/** Conveniencia: sólo el id de la sesión actual. */
export async function getSessionUserId(): Promise<string | null> {
  const u = await getSessionUser();
  return u?.id ?? null;
}

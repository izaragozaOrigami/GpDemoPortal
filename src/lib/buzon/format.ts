// Helpers de presentación (puros, seguros para cliente).

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Hora/fecha corta para la lista: "09:41", "Ayer", "6 jun", "6 jun 2025". */
export function formatListTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (dayDiff <= 0) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (dayDiff === 1) return "Ayer";
  if (d.getFullYear() === now.getFullYear()) return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Fecha completa para el lector: "8 jun 2026 · 09:41". */
export function formatFullDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Iniciales (máx 2) a partir del nombre del remitente. */
export function initials(name: string): string {
  const clean = (name || "").replace(/^GP Fleet — /i, "").trim();
  if (!clean) return "?";
  return clean
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Color estable derivado del nombre (para el avatar). */
export function avatarColor(name: string): string {
  const palette = ["#F7931E", "#5B8DEF", "#9B8AFB", "#46C97E", "#EF6F6C", "#3FB7C4"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

/** Corto, p. ej. "d55dccf5" del GUID, para el chip de usuario. */
export function shortUid(uid: string): string {
  return (uid || "").split("-")[0] || uid;
}

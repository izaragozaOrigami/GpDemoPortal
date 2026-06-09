import type { FolderId } from "./types";

// El flujo que inyecta API Flotas etiqueta el asunto con [UID:<guid>].
const UID_RE = /\[UID:\s*([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\s*\]/;

/** Devuelve el GUID del usuario embebido en el asunto, o null. */
export function extractUid(subject: string | null | undefined): string | null {
  if (!subject) return null;
  const m = subject.match(UID_RE);
  return m ? m[1].toLowerCase() : null;
}

/** Quita el tag [UID:...] del asunto y normaliza espacios. */
export function cleanSubject(subject: string | null | undefined): string {
  if (!subject) return "(sin asunto)";
  return subject.replace(UID_RE, "").replace(/\s{2,}/g, " ").trim() || "(sin asunto)";
}

// --- Catálogo de clasificación (derivado de Flotas_API_Correos_Endpoints.xlsx) ---

// Refacciones / Compras (plantillas RS*): asuntos fijos sin folio.
const RS_SUBJECTS = new Set([
  "compra de refacciones",
  "cotización de refacciones",
  "pedido con comentarios",
  "fechas de entrega",
  "entrega de refacciones",
  "pedido entregado",
  "reporte de daños",
  "actualización de factura",
  "alta de gr",
  "solicitud de evidencia",
  "orden de compra",
]);

// Mantenimiento Externo (plantillas ME*): el asunto suele iniciar con {Folio}.
const ME_PHRASES = [
  "cotización de mantenimiento",
  "cambios en cotización de mantenimiento",
  "aprobación de cotización",
  "solicitud de factura",
  "devolución de factura",
  "comentarios sobre la reparación",
  "solicitud de garantía",
  "número gr registrado",
  "número gr",
];

/**
 * Asigna una carpeta a partir del asunto LIMPIO.
 * Desambigua "Cotización de refacciones" (Compras) vs "Cotización de
 * mantenimiento" (Mtto Externo) por las palabras clave refacciones/mantenimiento.
 */
export function classifyFolder(cleanedSubject: string): FolderId {
  const s = cleanedSubject.toLowerCase().trim();

  if (s.startsWith("reporte de bajas")) return "bajas";
  if (s.includes("refacciones")) return "refacciones";
  if (RS_SUBJECTS.has(s)) return "refacciones";
  if (s.includes("mantenimiento")) return "mantenimiento";
  if (ME_PHRASES.some((p) => s.includes(p))) return "mantenimiento";

  return "otros";
}

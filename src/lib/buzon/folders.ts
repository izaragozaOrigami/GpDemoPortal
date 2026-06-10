import type { FolderId } from "./types";

export type FolderDef = { id: FolderId; label: string; icon: string };

// Carpetas que ve el cliente. El orden importa (así se pintan).
export const FOLDERS: FolderDef[] = [
  { id: "todos", label: "Todos", icon: "inbox" },
  { id: "refacciones", label: "Refacciones / Compras", icon: "package" },
  { id: "mantenimiento", label: "Mantenimiento Externo", icon: "wrench" },
  { id: "bajas", label: "Reporte de bajas", icon: "trendDown" },
  { id: "otros", label: "Otros", icon: "mail" },
  { id: "papelera", label: "Papelera", icon: "trash" },
];

// Carpetas de flujo de negocio (excluye Todos y Papelera) para clasificación.
export const FLUJO_FOLDERS = FOLDERS.filter(
  (f) => f.id !== "todos" && f.id !== "papelera"
);

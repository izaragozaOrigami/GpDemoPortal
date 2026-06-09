// Tipos compartidos del módulo Buzón.

export type FolderId =
  | "todos"
  | "refacciones"
  | "mantenimiento"
  | "bajas"
  | "otros"
  | "papelera";

export type DemoEmail = {
  id: string;
  /** Asunto ya limpio (sin el tag [UID:...]). */
  subject: string;
  senderName: string;
  senderAddress: string;
  /** ISO UTC. */
  receivedDateTime: string;
  preview: string;
  isRead: boolean;
  /** Flujo de negocio (carpeta). Nunca es "papelera"/"todos". */
  flujo: FolderId;
  hasAttachment: boolean;
  /** Está en la papelera (estado por usuario, no toca el buzón real). */
  trashed: boolean;
};

export type DemoEmailDetail = DemoEmail & {
  /** HTML ya saneado, listo para render. */
  bodyHtml: string;
};

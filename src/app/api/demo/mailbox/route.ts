import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/buzon/auth";
import { getDeletedItemsId, listMessages } from "@/lib/buzon/graph";
import { classifyFolder, cleanSubject, extractUid } from "@/lib/buzon/classify";
import type { DemoEmail } from "@/lib/buzon/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// El buzón es compartido y el filtrado por [UID:] es en memoria, así que
// escaneamos varias páginas para no perder correos del usuario.
const MAX_MESSAGES_SCANNED = 300;
const PAGE_SIZE = 50;

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const deletedId = await getDeletedItemsId();
    const emails: DemoEmail[] = [];
    let scanned = 0;
    let nextLink: string | null = null;

    do {
      const page = await listMessages(
        nextLink ? { nextLink } : { top: PAGE_SIZE }
      );
      for (const msg of page.messages) {
        scanned++;
        if (extractUid(msg.subject) !== userId) continue;
        const subject = cleanSubject(msg.subject);
        emails.push({
          id: msg.id,
          subject,
          senderName:
            msg.from?.emailAddress?.name ||
            msg.from?.emailAddress?.address ||
            "Desconocido",
          senderAddress: msg.from?.emailAddress?.address || "",
          receivedDateTime: msg.receivedDateTime || "",
          preview: (msg.bodyPreview || "").replace(/\s+/g, " ").trim(),
          isRead: !!msg.isRead,
          flujo: classifyFolder(subject),
          hasAttachment: !!msg.hasAttachments,
          trashed: msg.parentFolderId === deletedId,
        });
      }
      nextLink = page.nextLink;
    } while (nextLink && scanned < MAX_MESSAGES_SCANNED);

    return NextResponse.json({ userId, emails });
  } catch (err) {
    console.error("[mailbox] error", err);
    return NextResponse.json(
      { error: "No se pudo leer el buzón" },
      { status: 502 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/buzon/auth";
import {
  deleteMessage,
  getMessage,
  getMessageSubject,
  moveMessage,
  setRead,
} from "@/lib/buzon/graph";
import { classifyFolder, cleanSubject, extractUid } from "@/lib/buzon/classify";
import type { DemoEmailDetail } from "@/lib/buzon/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const msg = await getMessage(id);
    if (!msg) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    // Re-verificar pertenencia: el correo DEBE traer el [UID:] de este usuario.
    if (extractUid(msg.subject) !== userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const subject = cleanSubject(msg.subject);
    const detail: DemoEmailDetail = {
      id: msg.id,
      subject,
      senderName:
        msg.from?.emailAddress?.name ||
        msg.from?.emailAddress?.address ||
        "Desconocido",
      senderAddress: msg.from?.emailAddress?.address || "",
      receivedDateTime: msg.receivedDateTime || "",
      preview: "",
      isRead: !!msg.isRead,
      flujo: classifyFolder(subject),
      hasAttachment: !!msg.hasAttachments,
      trashed: false, // el estado de papelera lo lleva la lista (meta)
      // El correo viene de la propia plataforma (interno/confiable) → se entrega
      // TAL CUAL, sin recortar nada. La seguridad la da el iframe sandbox (sin
      // scripts) donde se renderiza en el frontend.
      bodyHtml: msg.body?.content || "",
    };
    return NextResponse.json({ email: detail });
  } catch (err) {
    console.error("[mailbox/:id] error", err);
    return NextResponse.json(
      { error: "No se pudo leer el correo" },
      { status: 502 }
    );
  }
}

// Acciones sobre el correo (real en M365): leído/no leído, papelera, eliminar.
type Action = "read" | "unread" | "trash" | "restore" | "delete";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  let action: Action;
  try {
    action = (await req.json()).action;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  try {
    // SEGURIDAD: verificar que el correo es de ESTE usuario antes de escribir.
    const subject = await getMessageSubject(id);
    if (subject === null) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    if (extractUid(subject) !== userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    let newId: string | undefined;
    switch (action) {
      case "read":
        await setRead(id, true);
        break;
      case "unread":
        await setRead(id, false);
        break;
      case "trash":
        newId = (await moveMessage(id, "deleteditems")).id;
        break;
      case "restore":
        newId = (await moveMessage(id, "inbox")).id;
        break;
      case "delete":
        await deleteMessage(id);
        break;
      default:
        return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, id: newId ?? id });
  } catch (err) {
    console.error("[mailbox/:id] acción error", err);
    return NextResponse.json(
      { error: "No se pudo completar la acción" },
      { status: 502 }
    );
  }
}

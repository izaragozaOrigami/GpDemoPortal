import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";

// Cliente Graph app-only (client credentials). Se construye una vez por proceso.
let cached: Client | null = null;

function getMailbox(): string {
  const mbox = process.env.GRAPH_MAILBOX;
  if (!mbox) throw new Error("GRAPH_MAILBOX no configurado");
  return mbox;
}

function getClient(): Client {
  if (cached) return cached;

  const tenantId = process.env.GRAPH_TENANT_ID;
  const clientId = process.env.GRAPH_CLIENT_ID;
  const clientSecret = process.env.GRAPH_CLIENT_SECRET;
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Faltan GRAPH_TENANT_ID / GRAPH_CLIENT_ID / GRAPH_CLIENT_SECRET");
  }

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  cached = Client.init({
    authProvider: async (done) => {
      try {
        const token = await credential.getToken("https://graph.microsoft.com/.default");
        done(null, token?.token ?? null);
      } catch (err) {
        done(err as Error, null);
      }
    },
  });
  return cached;
}

export type GraphMessage = {
  id: string;
  subject?: string | null;
  bodyPreview?: string | null;
  isRead?: boolean | null;
  hasAttachments?: boolean | null;
  parentFolderId?: string | null;
  receivedDateTime?: string | null;
  from?: { emailAddress?: { name?: string; address?: string } } | null;
  toRecipients?: { emailAddress?: { name?: string; address?: string } }[] | null;
  body?: { contentType?: string; content?: string } | null;
};

const LIST_SELECT =
  "id,subject,from,toRecipients,receivedDateTime,bodyPreview,isRead,hasAttachments,parentFolderId";
const DETAIL_SELECT = "id,subject,from,toRecipients,receivedDateTime,body,hasAttachments";

/**
 * Trae una página de mensajes del buzón compartido. `nextLink` permite paginar
 * (cuando se pasa, se ignoran los demás parámetros y se sigue el odata link).
 */
export async function listMessages(opts?: {
  top?: number;
  nextLink?: string;
}): Promise<{ messages: GraphMessage[]; nextLink: string | null }> {
  const client = getClient();
  let res;
  if (opts?.nextLink) {
    res = await client.api(opts.nextLink).get();
  } else {
    res = await client
      .api(`/users/${encodeURIComponent(getMailbox())}/messages`)
      .header("Prefer", 'outlook.body-content-type="html"')
      .select(LIST_SELECT)
      .top(opts?.top ?? 50)
      .orderby("receivedDateTime desc")
      .get();
  }
  return {
    messages: (res?.value ?? []) as GraphMessage[],
    nextLink: (res?.["@odata.nextLink"] as string) ?? null,
  };
}

export async function getMessage(id: string): Promise<GraphMessage | null> {
  const client = getClient();
  const res = await client
    .api(`/users/${encodeURIComponent(getMailbox())}/messages/${id}`)
    .header("Prefer", 'outlook.body-content-type="html"')
    .select(DETAIL_SELECT)
    .get();
  return (res as GraphMessage) ?? null;
}

function userPath() {
  return `/users/${encodeURIComponent(getMailbox())}`;
}

// Id de la carpeta "Elementos eliminados" (papelera real). Cacheado.
let deletedItemsId: string | null = null;
export async function getDeletedItemsId(): Promise<string> {
  if (deletedItemsId) return deletedItemsId;
  const res = await getClient()
    .api(`${userPath()}/mailFolders/deleteditems`)
    .select("id")
    .get();
  deletedItemsId = res.id as string;
  return deletedItemsId;
}

/** Devuelve sólo el subject (para validar pertenencia en acciones). */
export async function getMessageSubject(id: string): Promise<string | null> {
  const res = await getClient()
    .api(`${userPath()}/messages/${id}`)
    .select("id,subject")
    .get();
  return (res?.subject as string) ?? null;
}

export async function setRead(id: string, isRead: boolean): Promise<void> {
  await getClient().api(`${userPath()}/messages/${id}`).patch({ isRead });
}

/** Mueve un mensaje a una carpeta well-known (devuelve el mensaje con su NUEVO id). */
export async function moveMessage(
  id: string,
  destinationId: "deleteditems" | "inbox"
): Promise<GraphMessage> {
  return (await getClient()
    .api(`${userPath()}/messages/${id}/move`)
    .post({ destinationId })) as GraphMessage;
}

export async function deleteMessage(id: string): Promise<void> {
  await getClient().api(`${userPath()}/messages/${id}`).delete();
}

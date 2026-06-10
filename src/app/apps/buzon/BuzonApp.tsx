"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { asset } from "@/lib/asset";
import { FOLDERS } from "@/lib/buzon/folders";
import { shortUid } from "@/lib/buzon/format";
import {
  BuzonTopbar,
  FolderEmpty,
  FolderList,
  Ico,
  MailItem,
  MailReader,
} from "@/components/buzon/ui";
import type { DemoEmail, DemoEmailDetail, FolderId } from "@/lib/buzon/types";
import type { SessionUser } from "@/lib/buzon/auth";

export default function BuzonApp({ user }: { user: SessionUser }) {
  const router = useRouter();
  const userLabel = user.name || `Usuario · ${shortUid(user.id)}`;
  const [emails, setEmails] = useState<DemoEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folder, setFolder] = useState<FolderId>("todos");
  const [selId, setSelId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DemoEmailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const detailCache = useRef<Record<string, DemoEmailDetail>>({});

  // silent=true: refresco en segundo plano (sin spinner ni borrar la vista).
  const loadList = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const r = await fetch(asset("/api/demo/mailbox"), {
          credentials: "include",
          cache: "no-store",
        });
        if (r.status === 401) {
          router.push("/login");
          return;
        }
        if (!r.ok) throw new Error("bad status");
        const data = await r.json();
        setEmails((data.emails ?? []) as DemoEmail[]);
        setError(null);
      } catch {
        if (!silent) setError("No se pudo cargar el buzón. Intenta de nuevo.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    loadList();
  }, [loadList]);

  // Auto-actualización: consulta el buzón cada 15 s (en silencio) para que los
  // correos nuevos aparezcan solos, sin tener que refrescar la página.
  useEffect(() => {
    const iv = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      loadList(true);
    }, 15000);
    return () => clearInterval(iv);
  }, [loadList]);

  const unreadByFolder = useMemo(() => {
    const o: Partial<Record<FolderId, number>> = { todos: 0 };
    for (const m of emails) {
      if (m.isRead) continue;
      if (m.trashed) {
        o.papelera = (o.papelera || 0) + 1;
        continue;
      }
      o.todos = (o.todos || 0) + 1;
      o[m.flujo] = (o[m.flujo] || 0) + 1;
    }
    return o;
  }, [emails]);

  const totalUnread = unreadByFolder.todos || 0;
  const list = useMemo(() => {
    if (folder === "papelera") return emails.filter((m) => m.trashed);
    if (folder === "todos") return emails.filter((m) => !m.trashed);
    return emails.filter((m) => !m.trashed && m.flujo === folder);
  }, [emails, folder]);
  const selected = emails.find((m) => m.id === selId) || null;
  const activeLabel = FOLDERS.find((f) => f.id === folder)?.label ?? "Todos";
  const folderUnread = unreadByFolder[folder] || 0;

  // Llama una acción del backend (real en M365).
  const callAction = useCallback(
    async (id: string, action: string) => {
      try {
        await fetch(asset(`/api/demo/mailbox/${id}`), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
      } catch {
        /* noop */
      }
    },
    []
  );

  const open = useCallback(
    async (id: string) => {
      setSelId(id);
      // Marcar como leído (optimista) y persistir en M365 (PATCH idempotente).
      setEmails((ms) => ms.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
      callAction(id, "read");

      const cached = detailCache.current[id];
      if (cached) {
        setDetail(cached);
        return;
      }
      setDetail(null);
      setDetailLoading(true);
      try {
        const r = await fetch(asset(`/api/demo/mailbox/${id}`), {
          credentials: "include",
          cache: "no-store",
        });
        if (r.ok) {
          const data = await r.json();
          detailCache.current[id] = data.email;
          setDetail(data.email as DemoEmailDetail);
        }
      } finally {
        setDetailLoading(false);
      }
    },
    [callAction]
  );

  const markUnread = useCallback(
    (id: string) => {
      setEmails((ms) => ms.map((m) => (m.id === id ? { ...m, isRead: false } : m)));
      callAction(id, "unread");
    },
    [callAction]
  );

  // trash / restore / delete cambian la carpeta (y el id) → recargar la lista.
  const moveAction = useCallback(
    async (id: string, action: "trash" | "restore" | "delete") => {
      setSelId(null);
      setDetail(null);
      // optimista: sacar de la vista actual
      setEmails((ms) =>
        action === "delete"
          ? ms.filter((m) => m.id !== id)
          : ms.map((m) => (m.id === id ? { ...m, trashed: action === "trash" } : m))
      );
      delete detailCache.current[id];
      await callAction(id, action);
      loadList(); // reconciliar con M365 (los ids cambian al mover)
    },
    [callAction, loadList]
  );

  const manualRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadList(true);
    setRefreshing(false);
  }, [loadList]);

  const pickFolder = useCallback((f: FolderId) => {
    setFolder(f);
    setSelId(null);
    setDetail(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(asset("/api/auth/logout"), { method: "POST", credentials: "include" });
    } finally {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="gp-scope bz-app gp-page-bg">
      <BuzonTopbar
        userLabel={userLabel}
        unread={totalUnread}
        onMenu={() => setDrawer(true)}
        onLogout={logout}
      />

      <div className="bz-grid-3">
        {/* Col 1 — Carpetas */}
        <aside className={"bz-col-folders" + (drawer ? " open" : "")}>
          <div className="bz-drawer-head only-mobile">
            <span className="gp-eyebrow">Carpetas</span>
            <button className="bz-iconbtn" onClick={() => setDrawer(false)} aria-label="Cerrar">{Ico.close()}</button>
          </div>
          <FolderList
            active={folder}
            unreadByFolder={unreadByFolder}
            onSelect={(f) => {
              pickFolder(f);
              setDrawer(false);
            }}
          />
        </aside>
        {drawer && <div className="bz-scrim only-mobile" onClick={() => setDrawer(false)} />}

        {/* Col 2 — Lista */}
        <section className={"bz-col-list" + (selId ? " has-detail" : "")}>
          <div className="bz-list-head">
            <div>
              <div className="bz-list-title">{activeLabel}</div>
              <div className="bz-list-count">
                {loading
                  ? "Cargando…"
                  : `${list.length} correo${list.length !== 1 ? "s" : ""}${folderUnread > 0 ? ` · ${folderUnread} sin leer` : ""}`}
              </div>
            </div>
            <button
              className="bz-iconbtn"
              onClick={manualRefresh}
              disabled={refreshing}
              title="Actualizar"
              aria-label="Actualizar bandeja"
            >
              <span className={refreshing ? "bz-spin" : undefined}>{Ico.refresh({ s: 18 })}</span>
            </button>
          </div>
          <div className="bz-list gp-scroll">
            {error ? (
              <FolderEmpty error={error} />
            ) : loading ? (
              <FolderEmpty />
            ) : list.length === 0 ? (
              <FolderEmpty />
            ) : (
              list.map((m) => (
                <MailItem key={m.id} mail={m} selected={selId === m.id} onClick={() => open(m.id)} />
              ))
            )}
          </div>
        </section>

        {/* Col 3 — Lectura */}
        <section className={"bz-col-reader" + (selId ? " open" : "")}>
          <MailReader
            meta={selected}
            detail={detail}
            loading={detailLoading}
            onBack={() => {
              setSelId(null);
              setDetail(null);
            }}
            onMarkUnread={markUnread}
            onTrash={(id) => moveAction(id, "trash")}
            onRestore={(id) => moveAction(id, "restore")}
            onDelete={(id) => moveAction(id, "delete")}
          />
        </section>
      </div>
    </div>
  );
}

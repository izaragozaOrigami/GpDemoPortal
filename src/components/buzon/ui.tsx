"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { FOLDERS } from "@/lib/buzon/folders";
import type { DemoEmail, DemoEmailDetail, FolderId } from "@/lib/buzon/types";
import {
  avatarColor,
  formatFullDate,
  formatListTime,
  initials,
} from "@/lib/buzon/format";

/* ---------- Iconos (stroke 1.7) ---------- */
type IcoProps = { s?: number };
const sz = (p?: IcoProps) => p?.s ?? 18;
export const Ico = {
  user: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p)} height={sz(p)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" /></svg>
  ),
  mail: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p)} height={sz(p)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></svg>
  ),
  back: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p) || 20} height={sz(p) || 20} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7" /></svg>
  ),
  download: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p)} height={sz(p)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v10m0 0 4-4m-4 4-4-4" /><path d="M5 18.5h14" /></svg>
  ),
  search: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p)} height={sz(p)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.2-3.2" /></svg>
  ),
  inbox: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p)} height={sz(p)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2 3h6l2-3h4" /><path d="M5 6.5 3.5 12v6.5h17V12L19 6.5z" /></svg>
  ),
  package: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p)} height={sz(p)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>
  ),
  wrench: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p)} height={sz(p)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 6.5a3.8 3.8 0 0 0-5 4.8L4 16.8 7.2 20l5.5-5.5a3.8 3.8 0 0 0 4.8-5l-2.4 2.4-2.1-.6-.6-2.1z" /></svg>
  ),
  trendDown: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p)} height={sz(p)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7l6 6 3-3 7 7" /><path d="M21 17v-4h-4" /></svg>
  ),
  menu: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p) || 20} height={sz(p) || 20} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
  ),
  close: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p) || 20} height={sz(p) || 20} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
  ),
  grid: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p)} height={sz(p)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></svg>
  ),
  trash: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p)} height={sz(p)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" /><path d="M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7" /><path d="M10 11v6M14 11v6" /></svg>
  ),
  undo: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p)} height={sz(p)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-4" /></svg>
  ),
  mailOpen: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p)} height={sz(p)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 4l9 6.5" /><path d="M3 10.5V19a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.5" /><path d="m3 10.5 9 6 9-6" /></svg>
  ),
  logout: (p?: IcoProps) => (
    <svg viewBox="0 0 24 24" width={sz(p)} height={sz(p)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" /><path d="M10 8l-4 4 4 4M6 12h11" /></svg>
  ),
} as const;

type IconKey = keyof typeof Ico;

/* ---------- Logo ---------- */
// Logo real de GPFleet. light=true (fondo claro, ej. login) usa el de texto gris;
// si no (fondo oscuro: topbar/header) usa la versión idéntica con texto blanco.
export function GPLogo({
  height = 30,
  light = false,
}: {
  height?: number;
  light?: boolean;
  tagline?: boolean;
}) {
  const src = light
    ? asset("/brand/gpfleet-logo.svg")
    : asset("/brand/gpfleet-logo-white.svg");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="GPFleet · gestión de activos"
      style={{ height, width: "auto", display: "block" }}
    />
  );
}

/* ---------- Avatar ---------- */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const c = avatarColor(name);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", flex: "none",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.34,
        color: c, background: `color-mix(in srgb, ${c} 16%, transparent)`,
        border: `1px solid color-mix(in srgb, ${c} 32%, transparent)`,
      }}
    >
      {initials(name)}
    </div>
  );
}

/* ---------- Topbar ---------- */
export function BuzonTopbar({
  userLabel,
  unread,
  onMenu,
  onLogout,
}: {
  userLabel: string;
  unread: number;
  onMenu?: () => void;
  onLogout?: () => void;
}) {
  return (
    <header className="bz-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {onMenu && (
          <button className="bz-iconbtn only-mobile" onClick={onMenu} aria-label="Carpetas">{Ico.menu()}</button>
        )}
        <Link href="/" aria-label="Ir a aplicaciones" style={{ display: "inline-flex" }}>
          <GPLogo height={26} tagline={false} />
        </Link>
        <span className="bz-topbar-sep" />
        <span className="gp-eyebrow dim" style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {Ico.inbox({ s: 15 })} Buzón
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/" className="gp-btn-ghost hide-xs" title="Volver a aplicaciones">
          {Ico.grid({ s: 16 })} Aplicaciones
        </Link>
        <span className="gp-unread-pill hide-xs">{Ico.mail({ s: 16 })} <b>{unread}</b>&nbsp;sin leer</span>
        <span className="gp-userpill">
          <span className="ava">{Ico.user({ s: 15 })}</span>
          {userLabel}
        </span>
        {onLogout && (
          <button className="bz-iconbtn" onClick={onLogout} aria-label="Salir" title="Salir">{Ico.logout({ s: 18 })}</button>
        )}
      </div>
    </header>
  );
}

/* ---------- Lista de carpetas ---------- */
export function FolderList({
  active,
  onSelect,
  unreadByFolder,
  vertical = true,
}: {
  active: FolderId;
  onSelect: (f: FolderId) => void;
  unreadByFolder: Partial<Record<FolderId, number>>;
  vertical?: boolean;
}) {
  return (
    <nav className={vertical ? "bz-folders" : "bz-folders-h"}>
      {vertical && <div className="gp-eyebrow" style={{ padding: "4px 12px 12px" }}>Carpetas</div>}
      {FOLDERS.map((f) => {
        const n = unreadByFolder[f.id] || 0;
        const on = active === f.id;
        const IcoFn = Ico[f.icon as IconKey] ?? Ico.mail;
        return (
          <button key={f.id} className={"bz-folder" + (on ? " active" : "")} onClick={() => onSelect(f.id)}>
            <span className="bz-folder-ico">{IcoFn({ s: 18 })}</span>
            <span className="bz-folder-label">{f.label}</span>
            {n > 0 && <span className="bz-folder-badge">{n}</span>}
          </button>
        );
      })}
    </nav>
  );
}

/* ---------- Item de la lista ---------- */
export function MailItem({
  mail,
  selected,
  onClick,
  compact = false,
}: {
  mail: DemoEmail;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button className={"bz-item" + (selected ? " selected" : "") + (mail.isRead ? "" : " unread")} onClick={onClick}>
      <span className="bz-dot-col">{!mail.isRead && <span className="bz-dot" />}</span>
      <Avatar name={mail.senderName} size={compact ? 38 : 40} />
      <span className="bz-item-body">
        <span className="bz-item-row1">
          <span className="bz-sender u-clamp1">{mail.senderName}</span>
          <span className="bz-time">{formatListTime(mail.receivedDateTime)}</span>
        </span>
        <span className="bz-subject u-clamp1">{mail.subject}</span>
        <span className="bz-preview u-clamp1">{mail.preview}</span>
        {mail.hasAttachment && <span className="bz-attach-flag">{Ico.download({ s: 13 })} Adjunto</span>}
      </span>
    </button>
  );
}

/* ---------- Render aislado del correo (iframe, fondo blanco) ---------- */
function EmailFrame({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(420);

  const srcDoc = useMemo(() => {
    const base =
      (typeof window !== "undefined" ? window.location.origin : "") +
      (process.env.NEXT_PUBLIC_BASE_PATH || "");
    // El correo carga el logo desde el host APAGADO (lalademosite) → reescribir.
    // 1) el logo → al logo local que sí carga (no más imagen rota).
    // 2) cualquier otra URL de ese host → al host vivo (gpfleetdemosite).
    const fixed = html
      .replace(
        /https:\/\/lalademosite\.azurewebsites\.net\/assets\/img\/logo-gpfleet\.svg/g,
        `${base}/brand/gpfleet-logo.svg`
      )
      .replace(
        /https:\/\/lalademosite\.azurewebsites\.net/g,
        "https://gpfleetdemosite.azurewebsites.net"
      );
    return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank">
<style>html,body{margin:0;padding:0}body{background:#f4f5f9;font-family:Inter,system-ui,Arial,sans-serif;color:#1a1a1a}img{max-width:100%}a{color:#0a66c2}</style>
</head><body>${fixed}</body></html>`;
  }, [html]);

  const measure = () => {
    try {
      const d = ref.current?.contentDocument;
      if (d?.body) setHeight(Math.max(360, d.body.scrollHeight + 24));
    } catch {
      /* noop */
    }
  };

  return (
    <iframe
      ref={ref}
      title="Correo"
      srcDoc={srcDoc}
      // sandbox SIN allow-scripts → el correo se pinta tal cual (HTML/CSS),
      // pero no se ejecuta ningún script. allow-same-origin permite medir el
      // alto; allow-popups deja abrir los enlaces del correo.
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      className="bz-reader-frame"
      style={{ width: "100%", height, border: 0 }}
      onLoad={() => {
        measure();
        setTimeout(measure, 400);
      }}
    />
  );
}

/* ---------- Lector ---------- */
export function MailReader({
  meta,
  detail,
  loading,
  onBack,
  onMarkUnread,
  onTrash,
  onRestore,
  onDelete,
}: {
  meta: DemoEmail | null;
  detail: DemoEmailDetail | null;
  loading: boolean;
  onBack?: () => void;
  onMarkUnread?: (id: string) => void;
  onTrash?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  if (!meta) {
    return (
      <div className="bz-empty">
        <div className="bz-empty-ico">{Ico.inbox({ s: 30 })}</div>
        <p className="bz-empty-title">Selecciona un correo</p>
        <p className="bz-empty-sub">Elige un mensaje de la lista para leerlo aquí.</p>
      </div>
    );
  }
  return (
    <article className="bz-reader gp-scroll">
      {onBack && (
        <button className="bz-iconbtn bz-reader-back only-mobile" onClick={onBack} aria-label="Volver">{Ico.back()}<span>Volver</span></button>
      )}

      <div className="bz-reader-actions">
        {meta.trashed ? (
          <>
            <button className="gp-btn-ghost" onClick={() => onRestore?.(meta.id)}>{Ico.undo({ s: 16 })} Restaurar</button>
            <button className="gp-btn-ghost danger" onClick={() => onDelete?.(meta.id)}>{Ico.trash({ s: 16 })} Eliminar definitivamente</button>
          </>
        ) : (
          <>
            <button className="gp-btn-ghost" onClick={() => onMarkUnread?.(meta.id)}>{Ico.mailOpen({ s: 16 })} Marcar como no leído</button>
            <button className="gp-btn-ghost" onClick={() => onTrash?.(meta.id)}>{Ico.trash({ s: 16 })} Enviar a papelera</button>
          </>
        )}
      </div>

      <h1 className="bz-reader-subject">{meta.subject}</h1>
      <div className="bz-reader-meta">
        <Avatar name={meta.senderName} size={44} />
        <div style={{ minWidth: 0 }}>
          <div className="bz-reader-from"><b>{meta.senderName}</b> {meta.senderAddress && <span>&lt;{meta.senderAddress}&gt;</span>}</div>
          <div className="bz-reader-to">Para: Usuario demo · <span>{formatFullDate(meta.receivedDateTime)}</span></div>
        </div>
      </div>
      {loading || !detail ? (
        <p className="bz-empty-sub" style={{ maxWidth: "none" }}>Cargando correo…</p>
      ) : (
        <EmailFrame html={detail.bodyHtml} />
      )}
      {detail?.hasAttachment && (
        <div className="bz-reader-attach">
          <div className="gp-eyebrow dim" style={{ marginBottom: 10 }}>Adjunto</div>
          <span className="gp-attach">
            <span className="xls">XLS</span>
            <span className="meta"><b>Archivo adjunto</b><span>Hoja de cálculo</span></span>
            <span className="dl">{Ico.download()}</span>
          </span>
        </div>
      )}
    </article>
  );
}

/* ---------- Estado vacío de carpeta ---------- */
export function FolderEmpty({ error }: { error?: string }) {
  return (
    <div className="bz-empty">
      <div className="bz-empty-ico">{Ico.mail({ s: 30 })}</div>
      <p className="bz-empty-title">{error ? "No se pudo cargar el buzón" : "Aún no hay correos en esta sesión demo"}</p>
      <p className="bz-empty-sub">{error || "Los correos generados por tu actividad aparecerán aquí."}</p>
    </div>
  );
}

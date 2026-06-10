import Link from "next/link";
import { redirect } from "next/navigation";
import { apps, statusStyles } from "@/lib/apps";
import { asset } from "@/lib/asset";
import { getSessionUser } from "@/lib/buzon/auth";
import PortalHeader from "@/components/PortalHeader";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <>
      <PortalHeader user={user} />
      <main className="flex-1">
        <section
          className="relative min-h-screen bg-slate-950 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${asset("/background-portal.webp")}')` }}
        >
          <div aria-hidden className="absolute inset-0 bg-slate-950/70" />
          <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                Aplicaciones
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Selecciona una aplicación para ver el preview interactivo.
              </h1>
              <p className="mt-4 text-slate-200">
                Productos móviles para la operación de flotilla. Haz clic
                en una tarjeta para abrir la app embebida y consultar su ficha
                técnica.
              </p>
            </div>

            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {apps
                .filter((app) => !app.hidden)
                .sort((a, b) => a.index.localeCompare(b.index))
                .map((app) => {
                const badge = statusStyles[app.status];
                const href = app.route ?? `/apps/${app.slug}`;
                const disabled = !app.embedUrl && !app.route;
                const hasImage = !!app.cardImage;

                return (
                  <li key={app.slug}>
                    <Link
                      href={href}
                      aria-disabled={disabled || undefined}
                      className="group relative flex h-[460px] flex-col items-stretch justify-between overflow-hidden rounded-2xl border-2 border-slate-900 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-[0_24px_48px_-24px_rgba(245,130,32,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      style={
                        hasImage
                          ? {
                              backgroundImage: `url('${app.cardImage}')`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    >
                      <div
                        aria-hidden
                        className={
                          hasImage
                            ? "absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/65 to-slate-950/85 transition group-hover:from-slate-950/45 group-hover:via-slate-950/55 group-hover:to-slate-950/80"
                            : "absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"
                        }
                      />

                      <div className="relative flex items-start justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                          App {app.index}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium uppercase tracking-widest text-orange-300">
                          aplicación
                        </p>
                        <p className="mt-2 text-3xl font-semibold tracking-tight text-white drop-shadow">
                          {app.name.toLowerCase()}
                        </p>
                        <p className="mt-4 max-w-xs text-sm text-slate-200">
                          {app.tagline}
                        </p>
                      </div>

                      <div className="relative flex items-center justify-end border-t border-white/15 pt-4 text-sm">
                        <span className="font-medium text-white transition group-hover:text-orange-300">
                          Abrir →
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}

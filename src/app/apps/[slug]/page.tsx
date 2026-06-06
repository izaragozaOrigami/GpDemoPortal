import Link from "next/link";
import { notFound } from "next/navigation";
import PhoneFrame from "@/components/PhoneFrame";
import CorreosPlaceholder from "@/components/CorreosPlaceholder";
import { apps, getApp, statusStyles } from "@/lib/apps";

export function generateStaticParams() {
  return apps.map((a) => ({ slug: a.slug }));
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) notFound();

  const badge = statusStyles[app.status];
  const placeholder = app.slug === "correos" ? <CorreosPlaceholder /> : null;

  return (
    <main className="flex-1">
      <section className="relative min-h-screen bg-slate-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-orange-500/15 via-orange-500/5 to-transparent"
        />

        <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-slate-300 transition hover:text-orange-400"
          >
            ← Volver a aplicaciones
          </Link>

          <div className="mt-8 grid items-start gap-10 md:grid-cols-[360px_1fr] md:gap-12">
            <div>
              <PhoneFrame
                title={`Vista previa de ${app.name}`}
                src={app.embedUrl}
                placeholder={placeholder}
              />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                  App {app.index}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {app.name}
              </h1>
              <p className="mt-2 text-sm text-slate-300">{app.tagline}</p>

              <p className="mt-6 leading-relaxed text-slate-200">
                {app.description}
              </p>

              <h2 className="mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Funcionalidades principales
              </h2>
              <ul className="mt-3 divide-y divide-white/10">
                {app.features.map((f) => (
                  <li key={f.title} className="py-3">
                    <p className="text-sm font-medium text-white">{f.title}</p>
                    <p className="mt-0.5 text-sm text-slate-300">{f.detail}</p>
                  </li>
                ))}
              </ul>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

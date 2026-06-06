export default function CorreosPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-8 text-center">
      <div className="flex h-20 w-24 items-center justify-center rounded-md border-[6px] border-slate-800">
        <div className="h-0 w-full border-t-[6px] border-slate-800" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Próximamente
        </p>
        <h4 className="mt-2 text-lg font-semibold text-slate-900">Correos</h4>
        <p className="mt-2 text-sm text-slate-600">
          La aplicación está pendiente de definición de alcance y despliegue.
        </p>
      </div>
      <div className="w-full max-w-[200px] space-y-2 text-left">
        <div className="h-2 w-full rounded bg-slate-200" />
        <div className="h-2 w-4/5 rounded bg-slate-200" />
        <div className="h-2 w-3/5 rounded bg-slate-200" />
      </div>
    </div>
  );
}

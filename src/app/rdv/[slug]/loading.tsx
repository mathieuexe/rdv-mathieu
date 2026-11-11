/** Squelette affiché pendant le chargement des créneaux : la page apparaît
 *  immédiatement au lieu d'attendre la réponse de la base. */
export default function BookingLoading() {
  return (
    <div className="mx-auto w-full max-w-[920px] animate-pulse px-4 py-6 sm:px-6 sm:py-12">
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-full bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-2/3 rounded-lg bg-slate-100" />
          <div className="h-4 w-1/3 rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="mt-6 h-7 w-64 rounded-full bg-slate-100" />
      <div className="mt-5 h-[420px] rounded-2xl border border-slate-200 bg-slate-50" />
    </div>
  );
}

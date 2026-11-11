/** Squelette affiché pendant le chargement des créneaux : la page apparaît
 *  immédiatement au lieu d'attendre la réponse de la base. */
export default function BookingLoading() {
  return (
    <div className="mx-auto w-full max-w-[1120px] animate-pulse px-6 py-12">
      <div className="h-4 w-32 rounded-full bg-slate-100" />
      <div className="mt-5 h-10 w-2/3 rounded-xl bg-slate-100" />
      <div className="mt-3 h-4 w-1/2 rounded-full bg-slate-100" />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-24 rounded-2xl border border-slate-200 bg-slate-50" />
        ))}
      </div>
    </div>
  );
}

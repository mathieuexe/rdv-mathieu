/** Squelette de l'administration pendant le chargement des données. */
export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-6 pb-12">
      <div className="h-8 w-64 rounded-lg bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 rounded-lg border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="h-80 rounded-lg border border-slate-200 bg-white" />
    </div>
  );
}

import { getSiteSettings } from "@/lib/data-access";

import { saveSettingsAction } from "../actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ saved, error }, settings] = await Promise.all([searchParams, getSiteSettings()]);

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Parametres globaux</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">Activez le mode maintenance et ajustez le message public.</p>
      </div>

      {saved ? <p className="mt-5 text-sm font-medium text-emerald-700">Configuration enregistree avec succes.</p> : null}
      {error ? <p className="mt-5 text-sm font-medium text-rose-700">Le formulaire contient au moins une erreur.</p> : null}

      <form action={saveSettingsAction} className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-[16px] border border-slate-200 p-5">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
              <input type="checkbox" name="maintenanceMode" defaultChecked={settings.maintenanceMode} />
              <span>Activer le mode maintenance global</span>
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Message de maintenance</span>
            <textarea
              name="maintenanceMessage"
              rows={6}
              defaultValue={settings.maintenanceMessage}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
            />
          </label>
        </div>

        <div className="rounded-[16px] border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-900">Periodes d'indisponibilite globales</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            {settings.globalBlackoutPeriods.length === 0 ? (
              <li className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-slate-500">
                Aucune indisponibilite globale configuree.
              </li>
            ) : (
              settings.globalBlackoutPeriods.map((period) => (
                <li key={period.id} className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="font-medium text-slate-900">
                    {period.startDate} → {period.endDate}
                  </p>
                  <p className="mt-2">{period.message}</p>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="xl:col-span-2">
          <button
            type="submit"
            className="inline-flex rounded-xl border border-slate-950 bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
          >
            Enregistrer les parametres
          </button>
        </div>
      </form>
    </section>
  );
}

import { getSiteSettings } from "@/lib/data-access";

import { saveSettingsAction } from "../actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ saved, error }, settings] = await Promise.all([searchParams, getSiteSettings()]);

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Paramètres globaux</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Activez le mode maintenance, ajustez le message public et préparez les indisponibilités globales.
        </p>
      </div>

      {saved ? <p className="mt-5 text-sm font-medium text-emerald-700">Configuration enregistrée avec succès.</p> : null}
      {error ? <p className="mt-5 text-sm font-medium text-rose-700">Le formulaire contient au moins une erreur.</p> : null}

      <form action={saveSettingsAction} className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-600 focus:bg-white"
            />
          </label>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">Périodes d'indisponibilité globales</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            {settings.globalBlackoutPeriods.map((period) => (
              <li key={period.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="font-medium text-slate-900">
                  {period.startDate} → {period.endDate}
                </p>
                <p className="mt-2">{period.message}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="xl:col-span-2">
          <button
            type="submit"
            className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-950"
          >
            Enregistrer les paramètres
          </button>
        </div>
      </form>
    </section>
  );
}

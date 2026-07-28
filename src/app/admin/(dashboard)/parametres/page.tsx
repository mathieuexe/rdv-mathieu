import { getSiteSettings } from "@/lib/data-access";

import { saveSettingsAction } from "../actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ saved, error }, settings] = await Promise.all([searchParams, getSiteSettings()]);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Parametres globaux</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Activez le mode maintenance, ajustez le message public et preparez les indisponibilites globales.
        </p>
      </div>

      {saved ? <p className="mt-5 text-sm font-medium text-emerald-700">Configuration enregistree avec succes.</p> : null}
      {error ? <p className="mt-5 text-sm font-medium text-rose-700">Le formulaire contient au moins une erreur.</p> : null}

      <form action={saveSettingsAction} className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-5">
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
              className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-5">
          <p className="text-sm font-semibold text-slate-900">Periodes d'indisponibilite globales</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            {settings.globalBlackoutPeriods.map((period) => (
              <li key={period.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
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
            className="inline-flex rounded-2xl bg-[linear-gradient(135deg,#4f46e5_0%,#2563eb_55%,#06b6d4_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.2)] transition hover:opacity-95"
          >
            Enregistrer les parametres
          </button>
        </div>
      </form>
    </section>
  );
}

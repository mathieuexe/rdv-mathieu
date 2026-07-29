import { headers } from "next/headers";

import { getSiteSettings } from "@/lib/data-access";
import { extractClientIpFromHeaders } from "@/lib/maintenance";

import { saveSettingsAction } from "../actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [requestHeaders, { saved, error }, settings] = await Promise.all([headers(), searchParams, getSiteSettings()]);
  const currentIp = extractClientIpFromHeaders(requestHeaders);
  const decodedError = error ? decodeURIComponent(error) : "";
  const isCurrentIpAlreadyAllowed = currentIp ? settings.maintenanceAllowedIps.includes(currentIp) : false;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Paramètres globaux</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Activez le mode maintenance, ajustez le message public et définissez les IP pouvant continuer à accéder au
          site.
        </p>
      </div>

      {saved ? (
        <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Configuration enregistrée avec succès.
        </p>
      ) : null}
      {error ? (
        <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {decodedError}
        </p>
      ) : null}

      <form action={saveSettingsAction} className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-5">
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Adresses IP autorisées</span>
            <textarea
              name="maintenanceAllowedIps"
              rows={6}
              defaultValue={settings.maintenanceAllowedIps.join("\n")}
              placeholder={"Exemple :\n82.66.10.25\n2001:db8::1"}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 font-mono text-sm outline-none transition focus:border-slate-950 focus:bg-white"
            />
            <span className="block text-xs leading-6 text-slate-500">
              Saisissez une IP par ligne. Ces adresses conservent l&apos;accès au site même si la maintenance est active.
            </span>
          </label>

          <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-5 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Mon IP actuelle</p>
            <p className="mt-2 font-mono text-sm text-slate-700">{currentIp ?? "IP non détectée."}</p>
            <label className="mt-4 flex items-center gap-3 text-sm font-medium text-slate-800">
              <input type="checkbox" name="allowCurrentIp" defaultChecked={isCurrentIpAlreadyAllowed} />
              <span>Ajouter automatiquement mon IP actuelle à la liste autorisée</span>
            </label>
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-900">Périodes d&apos;indisponibilité globales</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            {settings.globalBlackoutPeriods.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-slate-500">
                Aucune indisponibilité globale configurée.
              </li>
            ) : (
              settings.globalBlackoutPeriods.map((period) => (
                <li key={period.id} className="rounded-2xl border border-slate-200 px-4 py-3">
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
            className="inline-flex rounded-full border border-slate-950 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Enregistrer les paramètres
          </button>
        </div>
      </form>
    </section>
  );
}

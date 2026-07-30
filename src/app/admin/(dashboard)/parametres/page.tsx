import { headers } from "next/headers";
import { Settings, Save } from "lucide-react";

import { GlobalBlackoutPeriodsEditor } from "@/components/admin/global-blackout-periods-editor";
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
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Paramètres globaux</h1>
          <p className="mt-1 text-sm text-slate-500">
            Maintenance, widget, indisponibilités et sécurité d'accès.
          </p>
        </div>
      </section>

      {saved ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Configuration enregistrée avec succès.
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {decodedError}
        </div>
      ) : null}

      <form action={saveSettingsAction} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          
          {/* General Config Card */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <Settings className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Configuration du site</h2>
            </div>
            <div className="space-y-6 p-4 md:p-6">
              <div className="flex flex-col gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                <label className="flex items-center gap-3 text-sm font-medium text-slate-900">
                  <input type="checkbox" name="maintenanceMode" defaultChecked={settings.maintenanceMode} className="size-4 rounded border-slate-300" />
                  <span>Activer le mode maintenance global</span>
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-slate-900">
                  <input type="checkbox" name="enableWhatsappWidget" defaultChecked={settings.enableWhatsappWidget} className="size-4 rounded border-slate-300" />
                  <span>Afficher le widget WhatsApp public</span>
                </label>
              </div>

              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Message de maintenance</span>
                <textarea
                  name="maintenanceMessage"
                  rows={4}
                  defaultValue={settings.maintenanceMessage}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Adresses IP autorisées (Bypass maintenance)</span>
                <textarea
                  name="maintenanceAllowedIps"
                  rows={4}
                  defaultValue={settings.maintenanceAllowedIps.join("\n")}
                  placeholder={"82.66.10.25\n2001:db8::1"}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="block text-xs text-slate-500">Une IP par ligne.</span>
              </label>

              <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-sm">
                <p className="font-medium text-blue-900">Mon IP actuelle : <span className="font-mono">{currentIp ?? "Non détectée"}</span></p>
                <label className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-900">
                  <input type="checkbox" name="allowCurrentIp" defaultChecked={isCurrentIpAlreadyAllowed} className="size-4 rounded border-blue-300" />
                  <span>Autoriser mon IP automatiquement</span>
                </label>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <GlobalBlackoutPeriodsEditor periods={settings.globalBlackoutPeriods} />
          </section>
          
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Save className="size-4" />
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

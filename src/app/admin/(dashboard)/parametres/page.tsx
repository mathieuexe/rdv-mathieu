import { headers } from "next/headers";
import { Settings, Save } from "@/components/icons";

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
    <div className="adm-page">
      <section className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Paramètres globaux</h1>
          <p className="mt-1 text-sm text-slate-500">
            Maintenance, widget, indisponibilités et sécurité d'accès.
          </p>
        </div>
      </section>

      {saved ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Configuration enregistrée avec succès.
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {decodedError}
        </div>
      ) : null}

      <form action={saveSettingsAction} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          
          {/* General Config Card */}
          <section className="adm-card">
            <div className="adm-card-header">
              <Settings className="adm-card-icon" />
              <h2 className="adm-card-title">Configuration du site</h2>
            </div>
            <div className="space-y-6 p-4 md:p-6">
              <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <label className="flex items-center gap-3 text-sm font-medium text-slate-900">
                  <input type="checkbox" name="maintenanceMode" defaultChecked={settings.maintenanceMode} className="size-4 rounded border-slate-300" />
                  <span>Activer le mode maintenance global</span>
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-slate-900">
                  <input type="checkbox" name="enableWhatsappWidget" defaultChecked={settings.enableWhatsappWidget} className="size-4 rounded border-slate-300" />
                  <span>Afficher le widget WhatsApp public</span>
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-slate-900">
                  <input type="checkbox" name="enableBlackoutMarquee" defaultChecked={settings.enableBlackoutMarquee} className="size-4 rounded border-slate-300" />
                  <span>Afficher la barre d'indisponibilité ("À venir") sur la page d'accueil</span>
                </label>
              </div>

              <label className="block space-y-1.5 adm-label">
                <span>Message de maintenance</span>
                <textarea
                  name="maintenanceMessage"
                  rows={4}
                  defaultValue={settings.maintenanceMessage}
                  className="w-full adm-input px-3 py-2"
                />
              </label>

              <label className="block space-y-1.5 adm-label">
                <span>Adresses IP autorisées (Bypass maintenance)</span>
                <textarea
                  name="maintenanceAllowedIps"
                  rows={4}
                  defaultValue={settings.maintenanceAllowedIps.join("\n")}
                  placeholder={"82.66.10.25\n2001:db8::1"}
                  className="w-full adm-input px-3 py-2 font-mono text-sm"
                />
                <span className="block text-xs text-slate-500">Une IP par ligne.</span>
              </label>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm">
                <p className="font-medium text-blue-900">Mon IP actuelle : <span className="font-mono">{currentIp ?? "Non détectée"}</span></p>
                <label className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-900">
                  <input type="checkbox" name="allowCurrentIp" defaultChecked={isCurrentIpAlreadyAllowed} className="size-4 rounded border-blue-300" />
                  <span>Autoriser mon IP automatiquement</span>
                </label>
              </div>
            </div>
          </section>

          {/* Booking Blocking Card */}
          <section className="adm-card">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-rose-50 px-4 py-3">
              <h2 className="font-semibold text-rose-800">Blocage des rendez-vous</h2>
            </div>
            <div className="space-y-6 p-4 md:p-6">
              <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <label className="flex items-center gap-3 text-sm font-medium text-slate-900">
                  <input type="checkbox" name="bookingBlocked" defaultChecked={settings.bookingBlocked} className="size-4 rounded border-slate-300" />
                  <span>Bloquer totalement la prise de rendez-vous</span>
                </label>
              </div>

              <label className="block space-y-1.5 adm-label">
                <span>Motif du blocage (affiché publiquement)</span>
                <textarea
                  name="bookingBlockedMessage"
                  rows={3}
                  defaultValue={settings.bookingBlockedMessage || ""}
                  placeholder="Ex: Les prises de rendez-vous sont actuellement suspendues pour l'été."
                  className="w-full adm-input px-3 py-2"
                />
              </label>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="adm-card">
            <GlobalBlackoutPeriodsEditor periods={settings.globalBlackoutPeriods} />
          </section>
          
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 shadow-sm px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700"
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

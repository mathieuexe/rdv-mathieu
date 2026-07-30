import { Activity, Clock, Globe, Laptop, Smartphone, Tablet, Users } from "lucide-react";
import { getTrackingStats } from "@/lib/tracking";

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getDeviceIcon(device: string) {
  const d = device.toLowerCase();
  if (d === "mobile") return <Smartphone className="size-4" />;
  if (d === "tablet") return <Tablet className="size-4" />;
  return <Laptop className="size-4" />;
}

export default async function StatistiquesPage() {
  const stats = await getTrackingStats(30);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Statistiques & Tracking</h1>
        <p className="text-sm text-slate-500">
          Aperçu de l'activité sur votre site web pour les 30 derniers jours.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Activity className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Vues totales</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalViews}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Visiteurs uniques</p>
              <p className="text-2xl font-bold text-slate-900">{stats.uniqueVisitors}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Temps moyen / page</p>
              <p className="text-2xl font-bold text-slate-900">{formatDuration(stats.averageDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Pages les plus consultées</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.topPages.length > 0 ? (
                stats.topPages.map((page, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="overflow-hidden">
                      <p className="truncate text-sm font-medium text-slate-900">{page.title || page.path}</p>
                      <p className="truncate text-xs text-slate-500">{page.path}</p>
                    </div>
                    <span className="ml-4 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {page.views} vues
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Aucune donnée disponible.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Appareils</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.deviceStats.length > 0 ? (
                  stats.deviceStats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-slate-400">
                          {getDeviceIcon(stat.device)}
                        </div>
                        <p className="text-sm font-medium capitalize text-slate-900">{stat.device}</p>
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        {Math.round((stat.count / stats.totalViews) * 100)}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Aucune donnée disponible.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Pays</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.topCountries.length > 0 ? (
                  stats.topCountries.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="size-4 text-slate-400" />
                        <p className="text-sm font-medium text-slate-900">{stat.country}</p>
                      </div>
                      <span className="text-sm text-slate-600">{stat.count} vues</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Aucune donnée disponible.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

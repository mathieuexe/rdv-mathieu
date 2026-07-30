import Link from "next/link";
import { Search, Mail, History, Info } from "lucide-react";

import { getEmailLogByReference, getRecentEmailLogs } from "@/lib/data-access";
import { formatDateTimeFr } from "@/lib/utils";

export default async function EmailReferenceCheckerPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const reference = ref?.trim().toUpperCase() ?? "";

  const [result, recentLogs] = await Promise.all([
    reference ? getEmailLogByReference(reference) : Promise.resolve(null),
    getRecentEmailLogs(12),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Checker ref mail</h1>
          <p className="mt-1 text-sm text-slate-500">
            Recherchez une référence courte pour retrouver la source du mail, le destinataire, le statut d&apos;envoi et le rendez-vous lié si disponible.
          </p>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Search Card */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Recherche par référence</h2>
            </div>
            <div className="p-4 md:p-6">
              <form className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  name="ref"
                  defaultValue={reference}
                  placeholder="Ex : REF-1A2B3C"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <Search className="size-4" />
                  Rechercher
                </button>
              </form>
            </div>
          </section>

          {/* Search Result */}
          {reference && (
            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <Info className="size-4 text-slate-600" />
                <h2 className="font-semibold text-slate-800">Résultat pour {reference}</h2>
              </div>
              <div className="p-4 md:p-6">
                {result ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-500">Référence</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{result.reference}</p>
                      </div>
                      <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-500">Template</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{result.sourceLabel}</p>
                      </div>
                      <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-500">Statut</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{result.deliveryStatus}</p>
                      </div>
                    </div>

                    <div className="rounded-md border border-slate-200 p-4">
                      <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                        <div>
                          <dt className="text-xs font-medium text-slate-500">Destinataire</dt>
                          <dd className="mt-1 text-slate-900">{result.recipientEmail}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-500">Sujet</dt>
                          <dd className="mt-1 text-slate-900">{result.subject}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-500">Date</dt>
                          <dd className="mt-1 text-slate-900">
                            {formatDateTimeFr(result.createdAt, { dateStyle: "full", timeStyle: "short" })}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-500">Resend email id</dt>
                          <dd className="mt-1 text-slate-900">{result.resendEmailId ?? "Aucun id retourné"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-500">Rendez-vous</dt>
                          <dd className="mt-1 text-slate-900">
                            {result.appointmentId ? (
                              <Link href={`/admin/rendez-vous/${result.appointmentId}`} className="text-blue-600 hover:underline">
                                Ouvrir la fiche du rendez-vous
                              </Link>
                            ) : (
                              "Aucun rendez-vous associé"
                            )}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs font-medium text-slate-500">Source technique</dt>
                          <dd className="mt-1 text-slate-900">{result.sourceType}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs font-medium text-slate-500">Metadata</dt>
                          <dd className="mt-1 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                            <pre>{JSON.stringify(result.metadata, null, 2)}</pre>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500">
                    Aucune référence mail trouvée pour <span className="font-semibold">{reference}</span>.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <History className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Historique récent</h2>
            </div>
            <div className="p-4">
              {recentLogs.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                  Aucun mail journalisé pour le moment.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="rounded-md border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <Link 
                          href={`/admin/checker-ref-mail?ref=${log.reference}`}
                          className="font-semibold text-blue-600 hover:underline text-sm"
                        >
                          {log.reference}
                        </Link>
                        <span className="shrink-0 text-xs text-slate-500">
                          {formatDateTimeFr(log.createdAt, { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-700">{log.sourceLabel}</p>
                      <p className="text-xs text-slate-500">{log.recipientEmail}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {log.deliveryStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

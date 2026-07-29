import Link from "next/link";

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
    <section className="space-y-6">
      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Email</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Checker ref mail</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Recherchez une reference courte pour retrouver la source du mail, le destinataire, le statut d&apos;envoi et
          le rendez-vous lie si disponible.
        </p>

        <form className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            name="ref"
            defaultValue={reference}
            placeholder="Ex : REF-1A2B3C"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Rechercher
          </button>
        </form>
      </div>

      {reference ? (
        <div className="rounded-[20px] border border-slate-200 bg-white p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Resultat</p>
          {result ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-[16px] border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reference</p>
                  <p className="mt-2 font-semibold text-slate-950">{result.reference}</p>
                </div>
                <div className="rounded-[16px] border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Template</p>
                  <p className="mt-2 font-semibold text-slate-950">{result.sourceLabel}</p>
                </div>
                <div className="rounded-[16px] border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Statut</p>
                  <p className="mt-2 font-semibold text-slate-950">{result.deliveryStatus}</p>
                </div>
              </div>

              <div className="rounded-[16px] border border-slate-200 p-5">
                <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Destinataire</dt>
                    <dd className="mt-2 text-slate-950">{result.recipientEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Sujet</dt>
                    <dd className="mt-2 text-slate-950">{result.subject}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Date</dt>
                    <dd className="mt-2 text-slate-950">
                      {formatDateTimeFr(result.createdAt, { dateStyle: "full", timeStyle: "short" })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Resend email id</dt>
                    <dd className="mt-2 text-slate-950">{result.resendEmailId ?? "Aucun id retourne"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Rendez-vous</dt>
                    <dd className="mt-2 text-slate-950">
                      {result.appointmentId ? (
                        <Link href={`/admin/rendez-vous/${result.appointmentId}`} className="underline underline-offset-4">
                          Ouvrir la fiche du rendez-vous
                        </Link>
                      ) : (
                        "Aucun rendez-vous associe"
                      )}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Source technique</dt>
                    <dd className="mt-2 text-slate-950">{result.sourceType}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Metadata</dt>
                    <dd className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                      <pre>{JSON.stringify(result.metadata, null, 2)}</pre>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[16px] border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
              Aucune reference mail trouvee pour `{reference}`.
            </div>
          )}
        </div>
      ) : null}

      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Historique recent</p>
        <div className="mt-5 space-y-3">
          {recentLogs.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
              Aucun mail journalise pour le moment.
            </div>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="rounded-[16px] border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{log.reference}</p>
                    <p className="mt-1 text-sm text-slate-600">{log.sourceLabel}</p>
                    <p className="mt-1 text-sm text-slate-500">{log.recipientEmail}</p>
                    <p className="mt-1 text-sm text-slate-500">Statut : {log.deliveryStatus}</p>
                    <p className="mt-1 text-sm text-slate-500">Resend : {log.resendEmailId ?? "Aucun id retourne"}</p>
                  </div>
                  <div className="text-sm text-slate-500">
                    {formatDateTimeFr(log.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

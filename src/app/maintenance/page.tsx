import Link from "next/link";
import { Clock3, Wrench } from "lucide-react";

import { getSiteSettings } from "@/lib/data-access";

export default async function MaintenancePage() {
  const settings = await getSiteSettings();

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(180deg,#071120_0%,#0f172a_100%)] px-4 py-8 text-white">
      <section className="w-full max-w-3xl rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur sm:p-12">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200">
          Maintenance globale
        </div>

        <h1 className="mt-6 font-serif text-5xl leading-none tracking-tight sm:text-6xl">
          Le planning est momentanément indisponible.
        </h1>
        <p className="mt-6 text-base leading-8 text-slate-300 sm:text-lg">{settings.maintenanceMessage}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <Wrench className="size-5 text-cyan-300" />
            <p className="mt-4 text-sm font-semibold text-white">Intervention en cours</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Les réservations reprennent automatiquement dès la désactivation du mode maintenance.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <Clock3 className="size-5 text-cyan-300" />
            <p className="mt-4 text-sm font-semibold text-white">Informations utiles</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Vous pouvez contacter l'entreprise par téléphone ou email si votre besoin est urgent.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/50"
        >
          Retour à l'accueil
        </Link>
      </section>
    </main>
  );
}

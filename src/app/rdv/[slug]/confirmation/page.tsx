import Link from "next/link";
import { CheckCheck, MailCheck } from "lucide-react";

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ slot?: string; firstName?: string }>;
}) {
  const { slot, firstName } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(180deg,#071120_0%,#0f172a_100%)] px-4 py-8 text-white">
      <section className="w-full max-w-3xl rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur sm:p-12">
        <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-emerald-200">
          Demande envoyée
        </div>

        <h1 className="mt-6 font-serif text-5xl leading-none tracking-tight sm:text-6xl">
          Merci{firstName ? ` ${firstName}` : ""}, votre demande est en attente de validation.
        </h1>
        <p className="mt-6 text-base leading-8 text-slate-300 sm:text-lg">
          Vous recevez un email de confirmation de demande. L'administrateur vous recontacte ensuite avec une réponse
          d'acceptation ou de refus.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <CheckCheck className="size-5 text-emerald-300" />
            <p className="mt-4 text-sm font-semibold text-white">Statut actuel</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">Votre créneau est réservé à titre provisoire.</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <MailCheck className="size-5 text-emerald-300" />
            <p className="mt-4 text-sm font-semibold text-white">Email envoyé</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {slot
                ? `Demande enregistrée pour le ${new Date(slot).toLocaleString("fr-FR", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}.`
                : "Le récapitulatif vous a été envoyé par email."}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/rdv/consultation-30min"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/50"
          >
            Réserver un autre créneau
          </Link>
        </div>
      </section>
    </main>
  );
}

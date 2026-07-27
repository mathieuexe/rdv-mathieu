import Link from "next/link";
import { ArrowLeft, CalendarRange, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/auth";
import { getAdminEmail, isSupabaseConfigured } from "@/lib/env";

import { loginAction } from "./actions";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session.isAuthenticated) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_32%),linear-gradient(180deg,#06111f_0%,#0f172a_100%)] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-between gap-8 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section className="space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/50 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            <span>Retour au site public</span>
          </Link>

          <div className="max-w-2xl space-y-5">
            <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200">
              Espace administrateur
            </span>
            <h1 className="font-serif text-5xl leading-none tracking-tight text-white sm:text-6xl">
              Pilotez vos demandes de rendez-vous sans perdre le contrôle.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Consultez les demandes en attente, activez le mode maintenance et gérez vos catégories de réservation depuis
              un tableau de bord pensé pour une micro-entreprise.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <CalendarRange className="size-5 text-cyan-300" />
              <h2 className="mt-4 text-lg font-semibold">Parcours de validation</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Chaque demande arrive en attente et peut être acceptée ou refusée avec un motif communiqué au client.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <ShieldCheck className="size-5 text-cyan-300" />
              <h2 className="mt-4 text-lg font-semibold">Authentification Supabase</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                L'accès réel au back-office se base sur Supabase Auth. Sans configuration, un mode démonstration est
                disponible pour prévisualiser l'interface.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            <p className="font-medium text-white">Compte administrateur attendu</p>
            <p className="mt-2">
              Email autorisé : <span className="font-semibold text-cyan-200">{getAdminEmail()}</span>
            </p>
            {!isSupabaseConfigured() ? (
              <p className="mt-2">Mot de passe de démonstration : <span className="font-semibold text-cyan-200">demo-admin</span></p>
            ) : null}
          </div>
        </section>

        <LoginForm action={loginAction} />
      </div>
    </main>
  );
}

import { Globe, LayoutTemplate, Search, Terminal, Star, CheckCircle, MapPin, ArrowRight } from "lucide-react";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

export const metadata = {
  title: "Qui suis-je ? - Mathieu CERENZIA",
  description: "Découvrez mon profil, mes compétences et mon expertise en développement web et automatisation.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <PublicHeader currentPath="/qui-suis-je" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    <MapPin className="size-4" />
                    <span>Sauvian, Hérault (France)</span>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    Développeur Web & <br /> Expert en Automatisation
                  </h1>
                  <p className="text-lg leading-relaxed text-slate-600">
                    Je m'appelle Mathieu, j'ai 25 ans et je suis originaire de Sauvian. Passionné d'informatique depuis mon plus jeune âge, j'ai obtenu un BTS Technicien Systèmes Réseaux et Sécurité avant de me lancer à mon compte en 2020.
                  </p>
                  <p className="text-lg leading-relaxed text-slate-600">
                    Depuis six ans, je conçois des sites internet et accompagne mes clients dans leur transformation digitale avec des solutions concrètes et sur mesure.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-5 fill-current" />
                      ))}
                    </div>
                    <span className="font-semibold text-slate-900">4,8/5</span>
                    <span className="text-sm text-slate-500">(13 avis)</span>
                  </div>
                  <div className="h-6 w-px bg-slate-300 hidden sm:block" />
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <CheckCircle className="size-5 text-emerald-500" />
                    <span>+ de 20 projets réalisés</span>
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href="https://www.malt.fr/profile/mathieucerenzia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Voir mon profil Malt
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-slate-200 shadow-xl border border-slate-200">
                  <img
                    src="/images/mathieu.jpg"
                    alt="Mathieu CERENZIA"
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Décoration */}
                <div className="absolute -bottom-6 -left-6 -z-10 h-64 w-64 rounded-full bg-blue-100 blur-3xl opacity-50" />
                <div className="absolute -top-6 -right-6 -z-10 h-64 w-64 rounded-full bg-slate-200 blur-3xl opacity-50" />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-white px-6 py-16 md:py-24 border-y border-slate-200">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Ce que je peux faire pour vous
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Des solutions techniques adaptées à vos besoins et à votre activité.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Globe className="size-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Création de sites internet</h3>
                <p className="text-slate-600 leading-relaxed">
                  Sites vitrines et boutiques en ligne, pensés pour représenter votre activité et convertir vos visiteurs en clients de manière efficace.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <LayoutTemplate className="size-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Interfaces sur mesure</h3>
                <p className="text-slate-600 leading-relaxed">
                  Selon vos besoins, je développe des solutions dédiées : interfaces de réservation, prise de commande pour restaurants, formulaires de contact, espaces clients, et systèmes de suivi des demandes.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Search className="size-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Visibilité & présence en ligne</h3>
                <p className="text-slate-600 leading-relaxed">
                  Gestion de vos réseaux sociaux et optimisation du référencement naturel (SEO) de votre site pour améliorer significativement votre visibilité sur le web.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Terminal className="size-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Automatisation & développement</h3>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-5 shrink-0 text-blue-600" />
                    <span>Scripts d'automatisation Windows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-5 shrink-0 text-blue-600" />
                    <span>Création de bots Discord sur mesure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-5 shrink-0 text-blue-600" />
                    <span>Administration de serveurs Windows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-5 shrink-0 text-blue-600" />
                    <span>Déploiement et gestion de solutions sous Linux</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
              Ma méthode de travail
            </h2>
            <p className="text-lg leading-relaxed text-slate-600">
              Autonome et autodidacte, j'aime relever de nouveaux défis techniques et m'adapter à des besoins variés. 
              Mon objectif : vous proposer des solutions concrètes, fiables et taillées sur mesure pour votre projet.
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
import Image from "next/image";
import { Globe, LayoutTemplate, Search, Terminal, Star, CheckCircle, MapPin, ArrowRight, Server } from "lucide-react";
import { DiscordIcon } from "@/components/shared/discord-icon";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

export const metadata = {
  title: "Qui suis-je ? - Mathieu CERENZIA",
  description: "Découvrez mon profil, mes compétences et mon expertise en développement web et automatisation.",
};

const services = [
  {
    icon: Globe,
    title: "Création de sites internet",
    text: "Sites vitrines et boutiques en ligne, pensés pour représenter votre activité et convertir vos visiteurs en clients de manière efficace.",
  },
  {
    icon: LayoutTemplate,
    title: "Interfaces sur mesure",
    text: "Selon vos besoins, je développe des solutions dédiées : interfaces de réservation, prise de commande pour restaurants, formulaires de contact, espaces clients, et systèmes de suivi des demandes.",
  },
  {
    icon: Search,
    title: "Visibilité & présence en ligne",
    text: "Gestion de vos réseaux sociaux et optimisation du référencement naturel (SEO) de votre site pour améliorer significativement votre visibilité sur le web.",
  },
  {
    icon: Server,
    title: "Hébergement & Messagerie",
    text: "Hébergement de votre site internet, enregistrement et gestion des noms de domaine, création et configuration de votre messagerie professionnelle (Microsoft Exchange, Google Workspace).",
  },
];

const serviceLists = [
  {
    icon: Terminal,
    title: "Automatisation & développement",
    points: [
      "Scripts d'automatisation Windows",
      "Administration de serveurs Windows",
      "Déploiement et gestion de solutions sous Linux",
    ],
  },
  {
    icon: DiscordIcon,
    title: "Communautés Discord & Stoat",
    points: ["Création sur mesure de serveur Discord ou Stoat", "Création sur mesure de bot Discord ou Stoat"],
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PublicHeader currentPath="/qui-suis-je" />

      <main className="flex-1">
        {/* ------------------------------------------------------------ Hero */}
        <section className="px-6 pb-16 pt-12 sm:pt-16">
          <div className="mx-auto flex max-w-[620px] flex-col items-center">
            <Image
              src="/images/mathieu-upscale.png"
              alt="Mathieu CERENZIA"
              width={96}
              height={96}
              priority
              className="size-24 rounded-full border border-slate-200 object-cover object-[45%_47%]"
            />

            <div className="da-pill mt-4">
              <MapPin className="size-4" />
              Denain, Hauts-de-France (France)
            </div>

            <h1 className="da-display mt-6 text-center text-[32px] leading-[1.15] sm:text-[42px]">
              Développeur web &
              <br />
              <span className="text-accent">expert en automatisation</span>
            </h1>

            <p className="mt-4 text-center text-[16px] leading-relaxed text-slate-900">
              Je m&apos;appelle Mathieu, j&apos;ai 25 ans et je suis originaire de Denain. Passionné d&apos;informatique
              depuis mon plus jeune âge, j&apos;ai obtenu un BTS Technicien Systèmes Réseaux et Sécurité avant de me
              lancer à mon compte en 2020.
            </p>

            <p className="mt-4 text-center text-[16px] leading-relaxed text-slate-500">
              Depuis six ans, je conçois des sites internet et accompagne mes clients dans leur transformation digitale
              avec des solutions concrètes et sur mesure. Je propose également la création sur mesure de serveurs et de
              bots Discord ou Stoat.
            </p>

            <a
              href="https://www.malt.fr/profile/mathieucerenzia"
              target="_blank"
              rel="noopener noreferrer"
              className="da-btn da-btn-primary mt-10 w-full max-w-[420px]"
            >
              Voir mon profil Malt
              <ArrowRight className="size-5" />
            </a>
          </div>
        </section>

        {/* -------------------------------------------------------- Chiffres */}
        <section className="border-y border-slate-200 px-6 py-12">
          <div className="mx-auto grid max-w-[720px] grid-cols-1 gap-8 text-center sm:grid-cols-3">
            <div className="da-reveal">
              <p className="da-display text-[32px] leading-none text-accent">4,8/5</p>
              <p className="mt-2 flex items-center justify-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </p>
              <p className="mt-2 text-[14px] text-slate-500">13 avis clients</p>
            </div>
            <div className="da-reveal">
              <p className="da-display text-[32px] leading-none text-accent">+20</p>
              <p className="mt-2 flex items-center justify-center text-emerald-500">
                <CheckCircle className="size-4" />
              </p>
              <p className="mt-2 text-[14px] text-slate-500">Projets réalisés</p>
            </div>
            <div className="da-reveal">
              <p className="da-display text-[32px] leading-none text-accent">6 ans</p>
              <p className="mt-2 flex items-center justify-center text-slate-400">
                <Globe className="size-4" />
              </p>
              <p className="mt-2 text-[14px] text-slate-500">À mon compte</p>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- Services */}
        <section className="px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-[960px]">
            <div className="da-reveal mx-auto max-w-[620px] text-center">
              <p className="da-eyebrow">Les prestations</p>
              <h2 className="da-title mt-2 text-[26px] sm:text-[32px]">Ce que je peux faire pour vous</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-slate-500">
                Des solutions techniques adaptées à vos besoins et à votre activité.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article key={service.title} className="da-card da-card-hover da-reveal flex flex-col p-6">
                  <span className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-accent-soft text-accent">
                    <service.icon className="size-5" />
                  </span>
                  <h3 className="da-title mt-4 text-[18px]">{service.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{service.text}</p>
                </article>
              ))}

              {serviceLists.map((service) => (
                <article key={service.title} className="da-card da-card-hover da-reveal flex flex-col p-6">
                  <span className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-accent-soft text-accent">
                    <service.icon className="size-5" />
                  </span>
                  <h3 className="da-title mt-4 text-[18px]">{service.title}</h3>
                  <ul className="mt-5 space-y-2.5 border-t border-slate-200/70 pt-4">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-[14px] leading-snug text-slate-900">
                        <CheckCircle className="mt-0.5 size-4 shrink-0 text-accent" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- Méthode */}
        <section className="border-t border-slate-200 px-6 py-16 sm:py-20">
          <div className="da-reveal mx-auto max-w-[620px] text-center">
            <p className="da-eyebrow">L&apos;approche</p>
            <h2 className="da-title mt-2 text-[26px] sm:text-[32px]">Ma méthode de travail</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-500">
              Autonome et autodidacte, j&apos;aime relever de nouveaux défis techniques et m&apos;adapter à des besoins
              variés. Mon objectif : vous proposer des solutions concrètes, fiables et taillées sur mesure pour votre
              projet.
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

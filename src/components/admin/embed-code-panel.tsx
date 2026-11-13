"use client";

import { useState } from "react";

import { Check, Copy, ExternalLink } from "@/components/icons";
import { cn } from "@/lib/utils";

interface EmbedCodePanelProps {
  slug: string;
  /** Adresse publique du site, utilisée dans le code à copier. */
  origin: string;
}

const variants = [
  {
    key: "inline",
    label: "Intégré",
    description: "L'agenda s'affiche directement dans la page et s'adapte à sa hauteur.",
  },
  {
    key: "popup",
    label: "Bouton",
    description: "Un bouton ouvre l'agenda dans une fenêtre, sans quitter la page.",
  },
  {
    key: "iframe",
    label: "Iframe",
    description: "Pour les outils qui refusent les scripts (hauteur fixe à ajuster).",
  },
  {
    key: "link",
    label: "Lien",
    description: "Lien direct vers la page de réservation, à partager ou à mettre sur un bouton.",
  },
] as const;

type VariantKey = (typeof variants)[number]["key"];

function buildCode(variant: VariantKey, slug: string, origin: string) {
  const script = `<script src="${origin}/embed.js" async></script>`;

  switch (variant) {
    case "inline":
      return `<div data-rdv-embed="${slug}"></div>\n${script}`;
    case "popup":
      return `<button type="button" data-rdv-popup="${slug}">Prendre rendez-vous</button>\n${script}`;
    case "iframe":
      return `<iframe src="${origin}/embed/${slug}" title="Prise de rendez-vous" width="100%" height="900" style="border:0" loading="lazy"></iframe>`;
    case "link":
      return `${origin}/rdv/${slug}`;
  }
}

/** Code d'intégration d'un agenda sur un autre site, prêt à copier. */
export function EmbedCodePanel({ slug, origin }: EmbedCodePanelProps) {
  const [variant, setVariant] = useState<VariantKey>("inline");
  const [copied, setCopied] = useState(false);
  const current = variants.find((item) => item.key === variant) ?? variants[0];
  const code = buildCode(variant, slug, origin);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="adm-card">
      <div className="adm-card-header justify-between">
        <h2 className="adm-card-title">Intégrer sur un site</h2>
        <a
          href={`/embed/${slug}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Aperçu
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Type d'intégration">
          {variants.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={item.key === variant}
              onClick={() => {
                setVariant(item.key);
                setCopied(false);
              }}
              className={cn(
                "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                item.key === variant ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="text-xs leading-relaxed text-slate-500">{current.description}</p>

        <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-900 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-slate-100">
          {code}
        </pre>

        <button type="button" onClick={copy} className="adm-btn adm-btn-secondary w-full">
          {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
          {copied ? "Copié" : "Copier le code"}
        </button>

        {variant === "inline" || variant === "popup" ? (
          <p className="text-xs leading-relaxed text-slate-500">
            Collez ce code dans la page de votre choix (WordPress, Wix, Webflow, site sur mesure…). Le script
            n&apos;est à ajouter qu&apos;une fois par page, même avec plusieurs agendas.
          </p>
        ) : null}
      </div>
    </section>
  );
}

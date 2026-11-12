"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { Building2, Mail, Phone, Plus, Trash2, X } from "@/components/icons";

import {
  deletePipelineCardAction,
  movePipelineCardAction,
  savePipelineCardAction,
} from "@/app/admin/(dashboard)/pipeline/actions";
import { CompanyField } from "@/components/shared/company-field";
import { PIPELINE_STAGES, type PipelineCard, type PipelineStage } from "@/lib/pipeline-shared";
import { cn, formatPhone } from "@/lib/utils";

interface PipelineBoardProps {
  initialCards: PipelineCard[];
}

interface CardDraft {
  id?: string;
  stage: PipelineStage;
  firstName: string;
  lastName: string;
  companyName: string;
  companySiren: string;
  email: string;
  phone: string;
  estimatedAmount: string;
  note: string;
}

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function emptyDraft(stage: PipelineStage): CardDraft {
  return { stage, firstName: "", lastName: "", companyName: "", companySiren: "", email: "", phone: "", estimatedAmount: "", note: "" };
}

function toDraft(card: PipelineCard): CardDraft {
  return {
    id: card.id,
    stage: card.stage,
    firstName: card.firstName,
    lastName: card.lastName,
    companyName: card.companyName ?? "",
    companySiren: card.companySiren ?? "",
    email: card.email ?? "",
    phone: card.phone ?? "",
    estimatedAmount: card.estimatedAmount === undefined ? "" : String(card.estimatedAmount),
    note: card.note ?? "",
  };
}

function sortCards(cards: PipelineCard[]) {
  return [...cards].sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt));
}

export function PipelineBoard({ initialCards }: PipelineBoardProps) {
  const [cards, setCards] = useState(() => sortCards(initialCards));
  const [draft, setDraft] = useState<CardDraft | null>(null);
  // Sur téléphone, une seule colonne est affichée à la fois : celle de l'étape choisie.
  const [mobileStage, setMobileStage] = useState<PipelineStage>("nouveau");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ stage: PipelineStage; beforeId: string | null } | null>(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, startSaving] = useTransition();
  const [, startMoving] = useTransition();

  const columns = useMemo(
    () => PIPELINE_STAGES.map((stage) => ({ ...stage, cards: cards.filter((card) => card.stage === stage.key) })),
    [cards],
  );

  // Fermeture de la fiche avec Échap.
  useEffect(() => {
    if (!draft) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDraft(null);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [draft]);

  /**
   * Déplace une fiche dans une colonne, avant `beforeId` (ou en fin de colonne).
   * L'écran est mis à jour tout de suite ; en cas d'échec côté serveur, on
   * revient à l'état précédent et on l'indique.
   */
  function moveCard(cardId: string, stage: PipelineStage, beforeId: string | null) {
    const moved = cards.find((card) => card.id === cardId);

    if (!moved || beforeId === cardId) {
      return;
    }

    const previous = cards;
    const target = cards.filter((card) => card.stage === stage && card.id !== cardId);
    const insertAt = beforeId ? target.findIndex((card) => card.id === beforeId) : -1;
    target.splice(insertAt === -1 ? target.length : insertAt, 0, { ...moved, stage });

    const reordered = target.map((card, index) => ({ ...card, position: index }));
    const others = cards.filter((card) => card.stage !== stage && card.id !== cardId);

    setCards(sortCards([...others, ...reordered]));
    setError("");

    startMoving(async () => {
      const result = await movePipelineCardAction({ id: cardId, stage, orderedIds: reordered.map((card) => card.id) });

      if (!result.ok) {
        setCards(previous);
        setError(result.error);
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft) return;

    const amount = draft.estimatedAmount.trim().replace(",", ".");
    const previousStage = cards.find((card) => card.id === draft.id)?.stage;

    setFormError("");
    startSaving(async () => {
      const result = await savePipelineCardAction({
        id: draft.id,
        stage: draft.stage,
        firstName: draft.firstName,
        lastName: draft.lastName,
        companyName: draft.companyName,
        companySiren: draft.companyName.trim() ? draft.companySiren : "",
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        estimatedAmount: amount ? Number(amount) : undefined,
        note: draft.note,
      });

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      // Changée d'étape depuis la fiche : elle arrive en bas de sa nouvelle colonne.
      const changedStage = previousStage !== undefined && previousStage !== result.card.stage;
      const lastPosition = Math.max(-1, ...cards.filter((card) => card.stage === result.card.stage).map((card) => card.position));
      const saved = changedStage ? { ...result.card, position: lastPosition + 1 } : result.card;

      setCards((current) => sortCards([...current.filter((card) => card.id !== saved.id), saved]));
      setMobileStage(saved.stage);
      setDraft(null);

      if (changedStage) {
        const orderedIds = [...cards.filter((card) => card.stage === saved.stage && card.id !== saved.id).map((card) => card.id), saved.id];
        await movePipelineCardAction({ id: saved.id, stage: saved.stage, orderedIds });
      }
    });
  }

  function handleDelete() {
    if (!draft?.id || !window.confirm("Supprimer définitivement cette fiche ?")) {
      return;
    }

    const cardId = draft.id;

    setFormError("");
    startSaving(async () => {
      const result = await deletePipelineCardAction(cardId);

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      setCards((current) => current.filter((card) => card.id !== cardId));
      setDraft(null);
    });
  }

  const openTotal = cards
    .filter((card) => card.stage !== "gagne" && card.stage !== "perdu")
    .reduce((sum, card) => sum + (card.estimatedAmount ?? 0), 0);

  return (
    <div className="space-y-6 pb-12">
      <section className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Pipeline</h1>
          <p className="mt-1 text-sm text-slate-500">
            {cards.length === 0
              ? "Créez une fiche par prospect, puis faites-la avancer d'étape en étape."
              : `${cards.length} fiche${cards.length > 1 ? "s" : ""} · ${euros.format(openTotal)} en cours.`}
            {cards.length > 0 ? (
              <>
                <span className="hidden md:inline"> Glissez une fiche pour la changer d&apos;étape.</span>
                <span className="md:hidden"> Ouvrez une fiche pour changer son étape.</span>
              </>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormError("");
            setDraft(emptyDraft("nouveau"));
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 shadow-sm px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="size-4" />
          Nouveau prospect
        </button>
      </section>

      {error ? (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {/* Téléphone : sélecteur d'étape, une colonne à la fois. */}
      <div className="-mx-4 overflow-x-auto px-4 md:hidden" role="tablist" aria-label="Étapes du pipeline">
        <div className="flex min-w-max gap-2">
          {columns.map((column) => {
            const isActive = column.key === mobileStage;

            return (
              <button
                key={column.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setMobileStage(column.key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700",
                )}
              >
                <span className={cn("size-2 rounded-full", column.accent)} />
                {column.label}
                <span className={cn("text-xs", isActive ? "text-slate-300" : "text-slate-400")}>{column.cards.length}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tablette et ordinateur : toutes les colonnes, avec défilement horizontal
          si l'écran est trop étroit ; sur très grand écran elles se partagent la largeur. */}
      <div className="pb-4 md:overflow-x-auto">
        <div className="flex items-start gap-4 md:min-w-max 2xl:min-w-0">
          {columns.map((column) => {
            const total = column.cards.reduce((sum, card) => sum + (card.estimatedAmount ?? 0), 0);
            const isDropColumn = dropTarget?.stage === column.key;

            return (
              <section
                key={column.key}
                onDragOver={(event) => {
                  if (!draggingId) return;
                  event.preventDefault();
                  setDropTarget((current) =>
                    current?.stage === column.key ? current : { stage: column.key, beforeId: null },
                  );
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggingId) moveCard(draggingId, column.key, dropTarget?.stage === column.key ? dropTarget.beforeId : null);
                  setDraggingId(null);
                  setDropTarget(null);
                }}
                className={cn(
                  "w-full flex-col rounded-lg border bg-slate-100/70 transition-colors md:flex md:w-[272px] md:shrink-0 2xl:w-auto 2xl:min-w-0 2xl:flex-1 2xl:shrink",
                  column.key === mobileStage ? "flex" : "hidden",
                  isDropColumn ? "border-blue-400 bg-blue-50/60" : "border-slate-200",
                )}
              >
                <header className="flex items-center justify-between gap-2 px-3 pb-2 pt-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={cn("size-2.5 shrink-0 rounded-full", column.accent)} />
                    <h2 className="truncate text-sm font-semibold text-slate-800">{column.label}</h2>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">{column.cards.length}</span>
                  </div>
                  {total > 0 ? <span className="shrink-0 text-xs font-medium text-slate-500">{euros.format(total)}</span> : null}
                </header>

                <div className="flex min-h-16 flex-col gap-2 px-2 pb-2">
                  {column.cards.map((card) => (
                    <article
                      key={card.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", card.id);
                        setDraggingId(card.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDropTarget(null);
                      }}
                      onDragOver={(event) => {
                        if (!draggingId || draggingId === card.id) return;
                        event.preventDefault();
                        event.stopPropagation();
                        setDropTarget({ stage: column.key, beforeId: card.id });
                      }}
                      className={cn(
                        "rounded-md border bg-white shadow-sm transition-opacity",
                        draggingId === card.id ? "opacity-40" : "opacity-100",
                        dropTarget?.beforeId === card.id ? "border-t-2 border-blue-500" : "border-slate-200",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFormError("");
                          setDraft(toDraft(card));
                        }}
                        className="block w-full cursor-grab rounded-md p-3 text-left hover:bg-slate-50 active:cursor-grabbing"
                      >
                        <span className="block text-sm font-semibold text-slate-900">
                          {[card.firstName, card.lastName].filter(Boolean).join(" ")}
                        </span>
                        {card.companyName ? (
                          <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                            <Building2 className="size-3.5 shrink-0 text-slate-400" />
                            <span className="truncate">{card.companyName}</span>
                          </span>
                        ) : null}
                        {card.note ? <span className="mt-2 line-clamp-2 block text-xs leading-relaxed text-slate-500">{card.note}</span> : null}
                        {card.estimatedAmount !== undefined || card.email || card.phone ? (
                          <span className="mt-2.5 flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-700">
                              {card.estimatedAmount !== undefined ? euros.format(card.estimatedAmount) : ""}
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-400">
                              {card.phone ? <Phone className="size-3.5" aria-label="Téléphone renseigné" /> : null}
                              {card.email ? <Mail className="size-3.5" aria-label="Email renseigné" /> : null}
                            </span>
                          </span>
                        ) : null}
                      </button>
                    </article>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setFormError("");
                      setDraft(emptyDraft(column.key));
                    }}
                    className="flex items-center gap-1.5 rounded-md px-2 py-2 text-left text-xs font-medium text-slate-500 transition-colors hover:bg-white hover:text-slate-800"
                  >
                    <Plus className="size-3.5" />
                    Ajouter une fiche
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {draft ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDraft(null);
          }}
        >
          <form
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-label={draft.id ? "Fiche prospect" : "Nouveau prospect"}
            className="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">{draft.id ? "Fiche prospect" : "Nouveau prospect"}</h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                aria-label="Fermer"
                className="flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="space-y-4 overflow-y-auto px-5 py-4">
              {formError ? (
                <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {formError}
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 adm-label">
                  <span>
                    Prénom <span className="font-normal text-slate-400">(facultatif)</span>
                  </span>
                  <input
                    value={draft.firstName}
                    onChange={(event) => setDraft({ ...draft, firstName: event.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1.5 adm-label">
                  <span>Nom</span>
                  <input
                    required
                    autoFocus={!draft.id}
                    value={draft.lastName}
                    onChange={(event) => setDraft({ ...draft, lastName: event.target.value })}
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="space-y-1.5 text-sm font-medium text-slate-700">
                <p>
                  Entreprise <span className="font-normal text-slate-400">(facultatif)</span>
                </p>
                <CompanyField
                  name={draft.companyName}
                  siren={draft.companySiren}
                  onChange={(company) => setDraft({ ...draft, companyName: company.name, companySiren: company.siren })}
                  inputClassName={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 adm-label">
                  <span>
                    Email <span className="font-normal text-slate-400">(facultatif)</span>
                  </span>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1.5 adm-label">
                  <span>
                    Téléphone <span className="font-normal text-slate-400">(facultatif)</span>
                  </span>
                  <input
                    type="tel"
                    value={draft.phone}
                    onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 adm-label">
                  <span>Étape</span>
                  <select
                    value={draft.stage}
                    onChange={(event) => setDraft({ ...draft, stage: event.target.value as PipelineStage })}
                    className={inputClass}
                  >
                    {PIPELINE_STAGES.map((stage) => (
                      <option key={stage.key} value={stage.key}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5 adm-label">
                  <span>
                    Montant estimé (€) <span className="font-normal text-slate-400">(facultatif)</span>
                  </span>
                  <input
                    inputMode="decimal"
                    value={draft.estimatedAmount}
                    onChange={(event) => setDraft({ ...draft, estimatedAmount: event.target.value.replace(/[^\d.,]/g, "") })}
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="block space-y-1.5 adm-label">
                <span>
                  Notes <span className="font-normal text-slate-400">(facultatif)</span>
                </span>
                <textarea
                  rows={4}
                  value={draft.note}
                  onChange={(event) => setDraft({ ...draft, note: event.target.value })}
                  placeholder="Besoin, contexte, prochaine action…"
                  className={inputClass}
                />
              </label>

              {draft.id && (draft.phone || draft.email) ? (
                <div className="flex flex-wrap gap-2">
                  {draft.phone ? (
                    <a
                      href={`tel:${draft.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Phone className="size-3.5" />
                      Appeler {formatPhone(draft.phone) || draft.phone}
                    </a>
                  ) : null}
                  {draft.email ? (
                    <a
                      href={`mailto:${draft.email}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Mail className="size-3.5" />
                      Écrire
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
              {draft.id ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                  Supprimer
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Enregistrement…" : draft.id ? "Enregistrer" : "Créer la fiche"}
                </button>
              </div>
            </footer>
          </form>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { Info, Calendar, Image as ImageIcon, Globe, MessageSquare, Save, Lock, Plus, Trash2, GripVertical, Settings } from "@/components/icons";

import { ImagePicker } from "@/components/admin/image-picker";
import type { AppointmentCategory, CustomField } from "@/types/domain";

const weekdayOptions = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
] as const;

const thumbnailConfig = {
  width: 320,
  height: 320,
  label: "Image / icône",
};

const bannerConfig = {
  width: 1600,
  height: 600,
  label: "Bannière",
};

interface CategoryEditorFormProps {
  action: (formData: FormData) => Promise<{ error: string } | void>;
  category?: AppointmentCategory | null;
  title: string;
  returnPath: string;
  saved?: boolean;
  error?: string;
}

function getDayDefaults(category: AppointmentCategory | null | undefined, weekday: (typeof weekdayOptions)[number]["key"]) {
  const rule = category?.availabilityRules.find((item) => item.weekday === weekday);
  const windows = rule?.windows ?? [];
  const sortedWindows = [...windows].sort((a, b) => a.start.localeCompare(b.start));
  const firstWindow = sortedWindows[0];
  const secondWindow = sortedWindows[1];

  return {
    enabled: category ? sortedWindows.length > 0 : weekday !== "samedi" && weekday !== "dimanche",
    startTime: firstWindow?.start ?? "09:00",
    endTime: sortedWindows[sortedWindows.length - 1]?.end ?? "18:00",
    breakStart: sortedWindows.length >= 2 ? firstWindow?.end ?? "" : "",
    breakEnd: sortedWindows.length >= 2 ? secondWindow?.start ?? "" : "",
  };
}

export function CategoryEditorForm({ action, category, title, returnPath, saved, error }: CategoryEditorFormProps) {
  const [categoryTitle, setCategoryTitle] = useState(category?.title ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [durationMinutes, setDurationMinutes] = useState(category?.durationMinutes ?? 30);
  const [appointmentMode, setAppointmentMode] = useState<AppointmentCategory["appointmentMode"]>(category?.appointmentMode ?? "visioconference");
  const [isOnline, setIsOnline] = useState(category?.isOnline ?? true);
  const [isHidden, setIsHidden] = useState(category?.isHidden ?? false);
  const [customMessage, setCustomMessage] = useState(category?.customMessage ?? "");
  const [isBookingBlocked, setIsBookingBlocked] = useState(category?.isBookingBlocked ?? false);
  const [bookingBlockMessage, setBookingBlockMessage] = useState(category?.bookingBlockMessage ?? "");
  const [thumbnailPreview, setThumbnailPreview] = useState(category?.thumbnailImageUrl ?? "");
  const [bannerPreview, setBannerPreview] = useState(category?.bannerImageUrl ?? "");
  const [imageError, setImageError] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>(category?.customFields ?? []);

  const [submitError, setSubmitError] = useState(error ?? "");
  const [isSaving, startSaving] = useTransition();
  const errorRef = useRef<HTMLDivElement>(null);

  // Envoi manuel plutôt que `<form action>` : React vide les champs d'un
  // formulaire après une action, ce qui effaçait toute la saisie à la moindre
  // erreur. Ici le formulaire reste tel quel et seule l'erreur s'affiche.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setSubmitError("");
    startSaving(async () => {
      let message = "";

      try {
        message = (await action(formData))?.error ?? "";
      } catch {
        message = "L'enregistrement a échoué. Vérifiez votre connexion puis réessayez.";
      }

      if (message) {
        setSubmitError(message);
        requestAnimationFrame(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
      }
    });
  }

  return (
    <div className="adm-page">
      <section className="adm-page-header">
        <div>
          <h1 className="adm-page-title">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Renseignez le titre, la description, la durée, le planning hebdomadaire et le type de rendez-vous.
          </p>
        </div>
      </section>

      {saved && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          La catégorie a bien été enregistrée.
        </div>
      )}

      {submitError && (
        <div
          ref={errorRef}
          role="alert"
          className="scroll-mt-24 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {submitError} Votre saisie a été conservée.
        </div>
      )}

      {imageError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {imageError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-3">
        <input type="hidden" name="categoryId" value={category?.id ?? ""} />
        <input type="hidden" name="returnPath" value={returnPath} />
        <input type="hidden" name="thumbnailImageDataUrl" value={thumbnailPreview} />
        <input type="hidden" name="bannerImageDataUrl" value={bannerPreview} />
        <input type="hidden" name="customFieldsJson" value={JSON.stringify(customFields)} />

        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* General Info Card */}
          <section className="adm-card">
            <div className="adm-card-header">
              <Info className="adm-card-icon" />
              <h2 className="adm-card-title">Informations générales</h2>
            </div>
            <div className="space-y-5 p-4 md:p-6">
              <label className="block space-y-1.5 adm-label">
                <span>Titre</span>
                <input
                  name="title"
                  defaultValue={category?.title}
                  required
                  className="w-full adm-input px-3 py-2"
                />
              </label>

              <label className="block space-y-1.5 adm-label">
                <span>Description</span>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={category?.description}
                  required
                  className="w-full adm-input px-3 py-2"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block space-y-1.5 adm-label">
                  <span>Durée (minutes)</span>
                  <input
                    name="durationMinutes"
                    type="number"
                    min={15}
                    step={15}
                    defaultValue={category?.durationMinutes ?? 30}
                    className="w-full adm-input px-3 py-2"
                  />
                </label>

                <label className="block space-y-1.5 adm-label">
                  <span>Type</span>
                  <select
                    name="appointmentMode"
                    defaultValue={category?.appointmentMode ?? "visioconference"}
                    className="w-full adm-input px-3 py-2"
                  >
                    <option value="telephone">Téléphonique</option>
                    <option value="physique">Présentiel</option>
                    <option value="discord">Discord (Vocal ou écrit)</option>
                    <option value="visioconference">Visioconférence</option>
                  </select>
                </label>

                <label className="block space-y-1.5 adm-label">
                  <span>
                    Slug{" "}
                    {category?.slug && (
                      <span className="font-normal text-slate-500">
                        (Lien :{" "}
                        <a 
                          href={`https://rdv.mathieucerenzia.fr/rdv/${category.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          rdv.mathieucerenzia.fr/rdv/{category.slug}
                        </a>
                        )
                      </span>
                    )}
                  </span>
                  <input
                    name="slug"
                    defaultValue={category?.slug}
                    placeholder="consultation-30min"
                    className="w-full adm-input px-3 py-2"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Schedule Card */}
          <section className="adm-card">
            <div className="adm-card-header">
              <Calendar className="adm-card-icon" />
              <h2 className="adm-card-title">Planning hebdomadaire</h2>
            </div>
            <div className="p-4 md:p-6">
              <p className="text-sm text-slate-600 mb-6">
                Sélectionnez les jours ouverts, les heures de disponibilité et, si besoin, une pause repas qui deviendra
                une période indisponible pour le client.
              </p>

              <div className="space-y-4">
                {weekdayOptions.map((day) => {
                  const defaults = getDayDefaults(category, day.key);

                  return (
                    <div key={day.key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-4 xl:grid-cols-[160px_repeat(4,minmax(0,1fr))] xl:items-end">
                        <label className="flex items-center gap-3 text-sm font-medium text-slate-900">
                          <input type="checkbox" name={`availabilityEnabled_${day.key}`} defaultChecked={defaults.enabled} className="size-4 rounded border-slate-300 text-blue-600" />
                          <span>{day.label}</span>
                        </label>

                        <label className="space-y-1.5 adm-label">
                          <span>Début</span>
                          <input
                            name={`availabilityStart_${day.key}`}
                            type="time"
                            lang="fr-FR"
                            step={900}
                            defaultValue={defaults.startTime}
                            className="w-full adm-input px-2 py-1.5"
                          />
                        </label>

                        <label className="space-y-1.5 adm-label">
                          <span>Fin</span>
                          <input
                            name={`availabilityEnd_${day.key}`}
                            type="time"
                            lang="fr-FR"
                            step={900}
                            defaultValue={defaults.endTime}
                            className="w-full adm-input px-2 py-1.5"
                          />
                        </label>

                        <label className="space-y-1.5 adm-label">
                          <span>Pause (début)</span>
                          <input
                            name={`breakStart_${day.key}`}
                            type="time"
                            lang="fr-FR"
                            step={900}
                            defaultValue={defaults.breakStart}
                            className="w-full adm-input px-2 py-1.5"
                          />
                        </label>

                        <label className="space-y-1.5 adm-label">
                          <span>Pause (fin)</span>
                          <input
                            name={`breakEnd_${day.key}`}
                            type="time"
                            lang="fr-FR"
                            step={900}
                            defaultValue={defaults.breakEnd}
                            className="w-full adm-input px-2 py-1.5"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Format français 24h : HH:MM. Si une pause repas est renseignée, elle doit rester comprise entre l&apos;heure
                de début et l&apos;heure de fin.
              </p>
            </div>
          </section>

          {/* Custom Fields Card */}
          <section className="adm-card">
            <div className="adm-card-header justify-between">
              <div className="flex items-center gap-2">
                <Settings className="size-4 text-slate-600" />
                <h2 className="adm-card-title">Champs personnalisés</h2>
              </div>
              <button
                type="button"
                onClick={() => setCustomFields([...customFields, { id: crypto.randomUUID(), type: "text", label: "", required: false, placeholder: "" }])}
                className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-blue-600 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                <Plus className="size-3.5" />
                Ajouter un champ
              </button>
            </div>
            <div className="p-4 md:p-6">
              {customFields.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Aucun champ personnalisé configuré pour cette catégorie.</p>
              ) : (
                <div className="space-y-6">
                  {customFields.map((field, index) => (
                    <div key={field.id} className="relative rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <button
                        type="button"
                        onClick={() => setCustomFields(customFields.filter(f => f.id !== field.id))}
                        className="absolute right-3 top-3 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <div className="grid gap-4 sm:grid-cols-2 pr-6">
                        <label className="block space-y-1.5 adm-label">
                          <span>Label du champ</span>
                          <input
                            value={field.label}
                            onChange={(e) => {
                              const newFields = [...customFields];
                              newFields[index].label = e.target.value;
                              setCustomFields(newFields);
                            }}
                            placeholder="Ex: Motif de la consultation"
                            className="w-full adm-input px-3 py-2"
                          />
                        </label>
                        <label className="block space-y-1.5 adm-label">
                          <span>Type</span>
                          <select
                            value={field.type}
                            onChange={(e) => {
                              const newFields = [...customFields];
                              newFields[index].type = e.target.value as "text" | "select";
                              if (e.target.value === "select" && !newFields[index].options) {
                                newFields[index].options = [{ label: "", value: "" }];
                              }
                              setCustomFields(newFields);
                            }}
                            className="w-full adm-input px-3 py-2"
                          >
                            <option value="text">Texte court</option>
                            <option value="select">Menu déroulant (Choix)</option>
                          </select>
                        </label>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => {
                              const newFields = [...customFields];
                              newFields[index].required = e.target.checked;
                              setCustomFields(newFields);
                            }}
                            className="size-4 rounded border-slate-300 text-blue-600"
                          />
                          Champ obligatoire
                        </label>
                      </div>

                      {field.type === "text" && (
                        <div className="mt-4">
                          <label className="block space-y-1.5 adm-label">
                            <span>Texte indicatif (Placeholder)</span>
                            <input
                              value={field.placeholder || ""}
                              onChange={(e) => {
                                const newFields = [...customFields];
                                newFields[index].placeholder = e.target.value;
                                setCustomFields(newFields);
                              }}
                              className="w-full adm-input px-3 py-2"
                            />
                          </label>
                        </div>
                      )}

                      {field.type === "select" && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-medium text-slate-700">Options du menu déroulant</p>
                          {field.options?.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input
                                value={opt.label}
                                onChange={(e) => {
                                  const newFields = [...customFields];
                                  if (newFields[index].options) {
                                    newFields[index].options![optIndex].label = e.target.value;
                                    newFields[index].options![optIndex].value = e.target.value;
                                  }
                                  setCustomFields(newFields);
                                }}
                                placeholder={`Option ${optIndex + 1}`}
                                className="flex-1 adm-input px-3 py-1.5 text-sm"
                              />
                              <input
                                value={opt.icon || ""}
                                onChange={(e) => {
                                  const newFields = [...customFields];
                                  if (newFields[index].options) {
                                    newFields[index].options![optIndex].icon = e.target.value;
                                  }
                                  setCustomFields(newFields);
                                }}
                                placeholder="Nom icône (ex: User)"
                                className="w-40 adm-input px-3 py-1.5 text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newFields = [...customFields];
                                  if (newFields[index].options) {
                                    newFields[index].options = newFields[index].options!.filter((_, i) => i !== optIndex);
                                  }
                                  setCustomFields(newFields);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newFields = [...customFields];
                              if (!newFields[index].options) newFields[index].options = [];
                              newFields[index].options!.push({ label: "", value: "" });
                              setCustomFields(newFields);
                            }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            + Ajouter une option
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Visuals Card */}
          <section className="adm-card">
            <div className="adm-card-header">
              <ImageIcon className="adm-card-icon" />
              <h2 className="adm-card-title">Visuels</h2>
            </div>
            <div className="p-4 md:p-6">
              <p className="mb-6 text-sm text-slate-600">
                Importez votre propre photo, collez un lien, ou piochez dans une banque d&apos;images libres de droits.
                Chaque visuel est recadré, redimensionné puis enregistré au format JPEG.
              </p>

              <div className="grid gap-8 sm:grid-cols-2">
                <ImagePicker
                  label={thumbnailConfig.label}
                  width={thumbnailConfig.width}
                  height={thumbnailConfig.height}
                  value={thumbnailPreview}
                  onChange={setThumbnailPreview}
                  onError={setImageError}
                  previewClassName="size-32"
                  emptyLabel="Aucun visuel"
                />

                <ImagePicker
                  label={bannerConfig.label}
                  width={bannerConfig.width}
                  height={bannerConfig.height}
                  value={bannerPreview}
                  onChange={setBannerPreview}
                  onError={setImageError}
                  previewClassName="aspect-[8/3] w-full"
                  emptyLabel="Aucune bannière"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <section className="adm-card">
            <div className="adm-card-header">
              <Globe className="adm-card-icon" />
              <h2 className="adm-card-title">Publication</h2>
            </div>
            <div className="p-4 space-y-4">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" name="isOnline" defaultChecked={category?.isOnline ?? true} className="size-4 rounded border-slate-300 text-blue-600" />
                <span className="font-medium">Catégorie visible au public</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" name="isHidden" defaultChecked={category?.isHidden ?? false} className="size-4 rounded border-slate-300 text-blue-600" />
                <span className="font-medium">Catégorie privée (masquée de l&apos;accueil, accessible par lien)</span>
              </label>
            </div>
          </section>

          <section className="adm-card">
            <div className="adm-card-header">
              <Lock className="adm-card-icon" />
              <h2 className="adm-card-title">Bloquer les réservations</h2>
            </div>
            <div className="p-4 space-y-4">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" name="isBookingBlocked" defaultChecked={category?.isBookingBlocked ?? false} className="size-4 rounded border-slate-300 text-rose-600" />
                <span className="font-medium text-rose-600">Désactiver la prise de rendez-vous</span>
              </label>
              
              <label className="block space-y-1.5 adm-label">
                <span>Message d&apos;indisponibilité (affiché au client)</span>
                <textarea
                  name="bookingBlockMessage"
                  rows={3}
                  defaultValue={category?.bookingBlockMessage}
                  placeholder="Les réservations pour cette catégorie sont temporairement suspendues..."
                  className="w-full adm-input px-3 py-2 text-sm"
                />
              </label>
            </div>
          </section>

          <section className="adm-card">
            <div className="adm-card-header">
              <MessageSquare className="adm-card-icon" />
              <h2 className="adm-card-title">Message personnalisé</h2>
            </div>
            <div className="p-4">
              <textarea
                name="customMessage"
                rows={5}
                defaultValue={category?.customMessage}
                placeholder="Instructions, congés, informations utiles..."
                className="w-full adm-input px-3 py-2 text-sm"
              />
            </div>
          </section>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 shadow-sm px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <Save className="size-4" />
              {isSaving ? "Enregistrement…" : "Enregistrer la catégorie"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

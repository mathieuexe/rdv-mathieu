"use client";

import { useRef, useState } from "react";
import { Info, Calendar, Image as ImageIcon, Globe, MessageSquare, Save, Lock } from "lucide-react";

import type { AppointmentCategory } from "@/types/domain";

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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Impossible de charger l'image."));
    image.src = src;
  });
}

async function resizeImageToJpeg(file: File, width: number, height: number) {
  const src = await readFileAsDataUrl(file);
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Le navigateur ne permet pas de traiter cette image.");
  }

  canvas.width = width;
  canvas.height = height;

  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  return canvas.toDataURL("image/jpeg", 0.86);
}

interface CategoryEditorFormProps {
  action: (formData: FormData) => Promise<void>;
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
    enabled: sortedWindows.length > 0,
    startTime: firstWindow?.start ?? "09:00",
    endTime: sortedWindows[sortedWindows.length - 1]?.end ?? "18:00",
    breakStart: sortedWindows.length >= 2 ? firstWindow?.end ?? "" : "",
    breakEnd: sortedWindows.length >= 2 ? secondWindow?.start ?? "" : "",
  };
}

export function CategoryEditorForm({ action, category, title, returnPath, saved, error }: CategoryEditorFormProps) {
  const [thumbnailPreview, setThumbnailPreview] = useState(category?.thumbnailImageUrl ?? "");
  const [bannerPreview, setBannerPreview] = useState(category?.bannerImageUrl ?? "");
  const [imageError, setImageError] = useState("");
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
    kind: "thumbnail" | "banner",
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setImageError("");
      const config = kind === "thumbnail" ? thumbnailConfig : bannerConfig;
      const jpegDataUrl = await resizeImageToJpeg(file, config.width, config.height);

      if (kind === "thumbnail") {
        setThumbnailPreview(jpegDataUrl);
      } else {
        setBannerPreview(jpegDataUrl);
      }
    } catch (processingError) {
      setImageError(
        processingError instanceof Error ? processingError.message : "Impossible de traiter cette image.",
      );
    }
  }

  function clearImage(kind: "thumbnail" | "banner") {
    setImageError("");

    if (kind === "thumbnail") {
      setThumbnailPreview("");

      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }
    } else {
      setBannerPreview("");

      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Renseignez le titre, la description, la durée, le planning hebdomadaire et le type de rendez-vous.
          </p>
        </div>
      </section>

      {saved && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          La catégorie a bien été enregistrée.
        </div>
      )}

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {imageError && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {imageError}
        </div>
      )}

      <form action={action} className="grid items-start gap-6 lg:grid-cols-3">
        <input type="hidden" name="categoryId" value={category?.id ?? ""} />
        <input type="hidden" name="returnPath" value={returnPath} />
        <input type="hidden" name="thumbnailImageDataUrl" value={thumbnailPreview} />
        <input type="hidden" name="bannerImageDataUrl" value={bannerPreview} />

        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* General Info Card */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <Info className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Informations générales</h2>
            </div>
            <div className="space-y-5 p-4 md:p-6">
              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Titre</span>
                <input
                  name="title"
                  defaultValue={category?.title}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Description</span>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={category?.description}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  <span>Durée (minutes)</span>
                  <input
                    name="durationMinutes"
                    type="number"
                    min={15}
                    step={15}
                    defaultValue={category?.durationMinutes ?? 30}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>

                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  <span>Type</span>
                  <select
                    name="appointmentMode"
                    defaultValue={category?.appointmentMode ?? "visioconference"}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="telephone">Téléphonique</option>
                    <option value="physique">Présentiel</option>
                    <option value="visioconference">Visioconférence</option>
                  </select>
                </label>

                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
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
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Schedule Card */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <Calendar className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Planning hebdomadaire</h2>
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
                    <div key={day.key} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-4 xl:grid-cols-[160px_repeat(4,minmax(0,1fr))] xl:items-end">
                        <label className="flex items-center gap-3 text-sm font-medium text-slate-900">
                          <input type="checkbox" name={`availabilityEnabled_${day.key}`} defaultChecked={defaults.enabled} className="size-4 rounded border-slate-300 text-blue-600" />
                          <span>{day.label}</span>
                        </label>

                        <label className="space-y-1.5 text-xs font-medium text-slate-700">
                          <span>Début</span>
                          <input
                            name={`availabilityStart_${day.key}`}
                            type="time"
                            lang="fr-FR"
                            step={900}
                            defaultValue={defaults.startTime}
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </label>

                        <label className="space-y-1.5 text-xs font-medium text-slate-700">
                          <span>Fin</span>
                          <input
                            name={`availabilityEnd_${day.key}`}
                            type="time"
                            lang="fr-FR"
                            step={900}
                            defaultValue={defaults.endTime}
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </label>

                        <label className="space-y-1.5 text-xs font-medium text-slate-700">
                          <span>Pause (début)</span>
                          <input
                            name={`breakStart_${day.key}`}
                            type="time"
                            lang="fr-FR"
                            step={900}
                            defaultValue={defaults.breakStart}
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </label>

                        <label className="space-y-1.5 text-xs font-medium text-slate-700">
                          <span>Pause (fin)</span>
                          <input
                            name={`breakEnd_${day.key}`}
                            type="time"
                            lang="fr-FR"
                            step={900}
                            defaultValue={defaults.breakEnd}
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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

          {/* Visuals Card */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <ImageIcon className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Visuels</h2>
            </div>
            <div className="p-4 md:p-6">
              <p className="text-sm text-slate-600 mb-6">
                Chaque image est automatiquement recadrée, redimensionnée puis enregistrée au format JPEG.
              </p>

              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{thumbnailConfig.label}</p>
                      <p className="text-xs text-slate-500">
                        {thumbnailConfig.width} x {thumbnailConfig.height} px
                      </p>
                    </div>
                    {thumbnailPreview && (
                      <button
                        type="button"
                        onClick={() => clearImage("thumbnail")}
                        className="text-xs font-medium text-rose-600 hover:text-rose-700"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(event) => void handleImageChange(event, "thumbnail")}
                    className="block w-full text-xs text-slate-600 file:mr-4 file:rounded-md file:border file:border-slate-200 file:bg-slate-50 file:px-3 file:py-1.5 file:font-medium file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
                  />

                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} alt="Aperçu image catégorie" className="h-full w-full object-cover" />
                    ) : (
                      <span className="px-4 text-center text-xs text-slate-400">Aucun visuel</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{bannerConfig.label}</p>
                      <p className="text-xs text-slate-500">
                        {bannerConfig.width} x {bannerConfig.height} px
                      </p>
                    </div>
                    {bannerPreview && (
                      <button
                        type="button"
                        onClick={() => clearImage("banner")}
                        className="text-xs font-medium text-rose-600 hover:text-rose-700"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(event) => void handleImageChange(event, "banner")}
                    className="block w-full text-xs text-slate-600 file:mr-4 file:rounded-md file:border file:border-slate-200 file:bg-slate-50 file:px-3 file:py-1.5 file:font-medium file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
                  />

                  <div className="flex aspect-[8/3] w-full items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Aperçu bannière catégorie" className="h-full w-full object-cover" />
                    ) : (
                      <span className="px-4 text-center text-xs text-slate-400">Aucune bannière</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <Globe className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Publication</h2>
            </div>
            <div className="p-4">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" name="isOnline" defaultChecked={category?.isOnline ?? true} className="size-4 rounded border-slate-300 text-blue-600" />
                <span className="font-medium">Catégorie visible au public</span>
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <Lock className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Bloquer les réservations</h2>
            </div>
            <div className="p-4 space-y-4">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" name="isBookingBlocked" defaultChecked={category?.isBookingBlocked ?? false} className="size-4 rounded border-slate-300 text-rose-600" />
                <span className="font-medium text-rose-600">Désactiver la prise de rendez-vous</span>
              </label>
              
              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Message d&apos;indisponibilité (affiché au client)</span>
                <textarea
                  name="bookingBlockMessage"
                  rows={3}
                  defaultValue={category?.bookingBlockMessage}
                  placeholder="Les réservations pour cette catégorie sont temporairement suspendues..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <MessageSquare className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Message personnalisé</h2>
            </div>
            <div className="p-4">
              <textarea
                name="customMessage"
                rows={5}
                defaultValue={category?.customMessage}
                placeholder="Instructions, congés, informations utiles..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </section>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Save className="size-4" />
              Enregistrer la catégorie
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

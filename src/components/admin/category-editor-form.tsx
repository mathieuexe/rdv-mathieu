"use client";

import { useRef, useState } from "react";

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
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Éditeur</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Renseignez le titre, la description, la durée, le planning hebdomadaire et le type de rendez-vous.
        </p>
      </div>

      <form action={action} className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <input type="hidden" name="categoryId" value={category?.id ?? ""} />
        <input type="hidden" name="returnPath" value={returnPath} />
        <input type="hidden" name="thumbnailImageDataUrl" value={thumbnailPreview} />
        <input type="hidden" name="bannerImageDataUrl" value={bannerPreview} />

        {saved ? (
          <div className="xl:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            La catégorie a bien été enregistrée.
          </div>
        ) : null}

        {error ? (
          <div className="xl:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {imageError ? (
          <div className="xl:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {imageError}
          </div>
        ) : null}

        <div className="space-y-5">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Titre</span>
            <input
              name="title"
              defaultValue={category?.title}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 outline-none transition duration-150 focus:border-slate-950 focus:bg-white"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Description</span>
            <textarea
              name="description"
              rows={5}
              defaultValue={category?.description}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 outline-none transition duration-150 focus:border-slate-950 focus:bg-white"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Durée (minutes)</span>
              <input
                name="durationMinutes"
                type="number"
                min={15}
                step={15}
                defaultValue={category?.durationMinutes ?? 30}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 outline-none transition duration-150 focus:border-slate-950 focus:bg-white"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Type</span>
              <select
                name="appointmentMode"
                defaultValue={category?.appointmentMode ?? "visioconference"}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 outline-none transition duration-150 focus:border-slate-950 focus:bg-white"
              >
                <option value="telephone">Téléphonique</option>
                <option value="physique">Présentiel</option>
                <option value="visioconference">Visioconférence</option>
              </select>
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Slug</span>
              <input
                name="slug"
                defaultValue={category?.slug}
                placeholder="consultation-30min"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 outline-none transition duration-150 focus:border-slate-950 focus:bg-white"
              />
            </label>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-5">
            <p className="text-sm font-semibold text-slate-900">Planning hebdomadaire</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Sélectionnez les jours ouverts, les heures de disponibilité et, si besoin, une pause repas qui deviendra
              une période indisponible pour le client.
            </p>

            <div className="mt-5 space-y-4">
              {weekdayOptions.map((day) => {
                const defaults = getDayDefaults(category, day.key);

                return (
                  <div key={day.key} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="grid gap-4 xl:grid-cols-[190px_repeat(4,minmax(0,1fr))] xl:items-end">
                      <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                        <input type="checkbox" name={`availabilityEnabled_${day.key}`} defaultChecked={defaults.enabled} />
                        <span>{day.label}</span>
                      </label>

                      <label className="space-y-2 text-sm font-medium text-slate-700">
                        <span>Début</span>
                        <input
                          name={`availabilityStart_${day.key}`}
                          type="time"
                          lang="fr-FR"
                          step={900}
                          defaultValue={defaults.startTime}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 outline-none transition duration-150 focus:border-slate-950 focus:bg-white"
                        />
                      </label>

                      <label className="space-y-2 text-sm font-medium text-slate-700">
                        <span>Fin</span>
                        <input
                          name={`availabilityEnd_${day.key}`}
                          type="time"
                          lang="fr-FR"
                          step={900}
                          defaultValue={defaults.endTime}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 outline-none transition duration-150 focus:border-slate-950 focus:bg-white"
                        />
                      </label>

                      <label className="space-y-2 text-sm font-medium text-slate-700">
                        <span>Pause repas début</span>
                        <input
                          name={`breakStart_${day.key}`}
                          type="time"
                          lang="fr-FR"
                          step={900}
                          defaultValue={defaults.breakStart}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 outline-none transition duration-150 focus:border-slate-950 focus:bg-white"
                        />
                      </label>

                      <label className="space-y-2 text-sm font-medium text-slate-700">
                        <span>Pause repas fin</span>
                        <input
                          name={`breakEnd_${day.key}`}
                          type="time"
                          lang="fr-FR"
                          step={900}
                          defaultValue={defaults.breakEnd}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 outline-none transition duration-150 focus:border-slate-950 focus:bg-white"
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

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-5">
            <p className="text-sm font-semibold text-slate-900">Visuels de la catégorie</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Chaque image est automatiquement recadrée, redimensionnée puis enregistrée au format JPEG.
            </p>

            <div className="mt-5 grid gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{thumbnailConfig.label}</p>
                    <p className="text-xs text-slate-500">
                      Taille finale : {thumbnailConfig.width} x {thumbnailConfig.height} px, JPEG.
                    </p>
                  </div>
                  {thumbnailPreview ? (
                    <button
                      type="button"
                      onClick={() => clearImage("thumbnail")}
                      className="text-xs font-medium text-slate-600 underline underline-offset-4"
                    >
                      Supprimer
                    </button>
                  ) : null}
                </div>

                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleImageChange(event, "thumbnail")}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border file:border-slate-200 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium"
                />

                <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Aperçu image catégorie" className="h-full w-full object-cover" />
                  ) : (
                    <span className="px-4 text-center text-xs text-slate-400">Aucun visuel sélectionné</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{bannerConfig.label}</p>
                    <p className="text-xs text-slate-500">
                      Taille finale : {bannerConfig.width} x {bannerConfig.height} px, JPEG.
                    </p>
                  </div>
                  {bannerPreview ? (
                    <button
                      type="button"
                      onClick={() => clearImage("banner")}
                      className="text-xs font-medium text-slate-600 underline underline-offset-4"
                    >
                      Supprimer
                    </button>
                  ) : null}
                </div>

                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleImageChange(event, "banner")}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border file:border-slate-200 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium"
                />

                <div className="flex aspect-[8/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Aperçu bannière catégorie" className="h-full w-full object-cover" />
                  ) : (
                    <span className="px-4 text-center text-xs text-slate-400">Aucune bannière sélectionnée</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-5">
            <p className="text-sm font-semibold text-slate-900">Publication</p>
            <label className="mt-4 flex items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" name="isOnline" defaultChecked={category?.isOnline ?? true} />
              <span>Catégorie visible sur le site public</span>
            </label>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-5">
            <p className="text-sm font-semibold text-slate-900">Message personnalisé</p>
            <textarea
              name="customMessage"
              rows={6}
              defaultValue={category?.customMessage}
              placeholder="Instructions, congés, informations utiles..."
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition duration-150 focus:border-slate-950"
            />
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-5 text-sm leading-7 text-slate-600">
            <p className="font-semibold text-slate-900">Disponibilités de la catégorie</p>
            <p className="mt-3">
              Chaque jour peut être activé séparément, avec une plage horaire dédiée et une pause repas facultative.
            </p>
          </div>
        </div>

        <div className="xl:col-span-2">
          <button
            type="submit"
            className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition duration-150 hover:bg-slate-800"
          >
            Enregistrer la catégorie
          </button>
        </div>
      </form>
    </section>
  );
}

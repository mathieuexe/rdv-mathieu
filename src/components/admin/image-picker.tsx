"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUp, Link2, LoaderCircle, Search, Sparkles, Trash2 } from "lucide-react";

import { resizeFileToJpeg, resizeRemoteUrlToJpeg } from "@/lib/image-processing";
import { cn } from "@/lib/utils";

type PickerTab = "upload" | "url" | "stock";
type StockProvider = "unsplash" | "pexels";

interface StockPhotoResult {
  id: string;
  provider: StockProvider;
  thumbUrl: string;
  sourceUrl: string;
  description: string;
  authorName: string;
  authorUrl: string;
  photoUrl: string;
  downloadLocation?: string;
}

interface PhotoCredit {
  authorName: string;
  authorUrl: string;
  providerLabel: string;
  photoUrl: string;
}

interface ImagePickerProps {
  label: string;
  /** Dimensions finales du visuel enregistré. */
  width: number;
  height: number;
  value: string;
  onChange: (value: string) => void;
  onError: (message: string) => void;
  /** Classes appliquées au cadre d'aperçu (carré, bandeau…). */
  previewClassName?: string;
  emptyLabel?: string;
}

const providerLabels: Record<StockProvider, string> = {
  unsplash: "Unsplash",
  pexels: "Pexels",
};

const tabs: Array<{ id: PickerTab; label: string; icon: typeof ImageUp }> = [
  { id: "upload", label: "Mon fichier", icon: ImageUp },
  { id: "url", label: "Lien", icon: Link2 },
  { id: "stock", label: "Banque d'images", icon: Sparkles },
];

export function ImagePicker({
  label,
  width,
  height,
  value,
  onChange,
  onError,
  previewClassName = "size-32",
  emptyLabel = "Aucun visuel",
}: ImagePickerProps) {
  const [activeTab, setActiveTab] = useState<PickerTab>("upload");
  const [provider, setProvider] = useState<StockProvider>("unsplash");
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<StockPhotoResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [credit, setCredit] = useState<PhotoCredit | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasLoadedStock = useRef(false);

  const runSearch = useCallback(
    async (nextProvider: StockProvider, nextQuery: string) => {
      setIsSearching(true);
      setSearchMessage("");

      try {
        const response = await fetch(
          `/api/admin/stock-photos?provider=${nextProvider}&q=${encodeURIComponent(nextQuery)}`,
        );
        const payload = await response.json();

        setPhotos(Array.isArray(payload.photos) ? payload.photos : []);

        if (payload.error) {
          setSearchMessage(String(payload.error));
        } else if ((payload.photos ?? []).length === 0) {
          setSearchMessage("Aucun résultat pour cette recherche.");
        }
      } catch {
        setPhotos([]);
        setSearchMessage("La recherche d'images est momentanément indisponible.");
      } finally {
        setIsSearching(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (activeTab === "stock" && !hasLoadedStock.current) {
      hasLoadedStock.current = true;
      void runSearch(provider, "");
    }
  }, [activeTab, provider, runSearch]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      onError("");
      setPendingId("upload");
      onChange(await resizeFileToJpeg(file, width, height));
      setCredit(null);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Impossible de traiter cette image.");
    } finally {
      setPendingId("");
    }
  }

  async function importFromUrl() {
    const trimmed = remoteUrl.trim();

    if (!trimmed) {
      return;
    }

    try {
      onError("");
      setPendingId("url");
      onChange(await resizeRemoteUrlToJpeg(trimmed, width, height));
      setCredit(null);
      setRemoteUrl("");
    } catch {
      onError("Impossible d'importer cette image. Vérifiez que le lien pointe directement vers un fichier image.");
    } finally {
      setPendingId("");
    }
  }

  async function selectStockPhoto(photo: StockPhotoResult) {
    try {
      onError("");
      setPendingId(photo.id);
      onChange(await resizeRemoteUrlToJpeg(photo.sourceUrl, width, height));
      setCredit({
        authorName: photo.authorName,
        authorUrl: photo.authorUrl,
        providerLabel: providerLabels[photo.provider],
        photoUrl: photo.photoUrl,
      });

      if (photo.downloadLocation) {
        // Exigence des conditions d'utilisation de l'API Unsplash.
        void fetch("/api/admin/stock-photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ downloadLocation: photo.downloadLocation }),
        });
      }
    } catch {
      onError("Impossible d'importer cette photo. Réessayez ou choisissez-en une autre.");
    } finally {
      setPendingId("");
    }
  }

  function clearImage() {
    onError("");
    onChange("");
    setCredit(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">
            {width} x {height} px
          </p>
        </div>
        {value ? (
          <button
            type="button"
            onClick={clearImage}
            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700"
          >
            <Trash2 className="size-3.5" />
            Supprimer
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50",
          previewClassName,
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={`Aperçu ${label}`} className="h-full w-full object-cover" />
        ) : (
          <span className="px-4 text-center text-xs text-slate-400">{emptyLabel}</span>
        )}
      </div>

      {credit ? (
        <p className="text-[11px] text-slate-500">
          Photo de{" "}
          <a href={credit.authorUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            {credit.authorName}
          </a>{" "}
          sur{" "}
          <a href={credit.photoUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            {credit.providerLabel}
          </a>
        </p>
      ) : null}

      <div className="rounded-md border border-slate-200">
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-medium">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 px-2 py-2 transition-colors first:rounded-tl-md last:rounded-tr-md",
                  isActive ? "bg-white text-blue-600 shadow-[inset_0_-2px_0_0_#2563eb]" : "text-slate-500 hover:text-slate-800",
                )}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-3">
          {activeTab === "upload" ? (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => void handleFileChange(event)}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-4 file:rounded-md file:border file:border-slate-200 file:bg-slate-50 file:px-3 file:py-1.5 file:font-medium file:text-slate-700 hover:file:bg-slate-100"
            />
          ) : null}

          {activeTab === "url" ? (
            <div className="flex gap-2">
              <input
                type="url"
                value={remoteUrl}
                onChange={(event) => setRemoteUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void importFromUrl();
                  }
                }}
                placeholder="https://images.unsplash.com/photo-..."
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => void importFromUrl()}
                disabled={pendingId === "url" || !remoteUrl.trim()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                {pendingId === "url" ? <LoaderCircle className="size-3.5 animate-spin" /> : null}
                Importer
              </button>
            </div>
          ) : null}

          {activeTab === "stock" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-md border border-slate-200 p-0.5">
                  {(Object.keys(providerLabels) as StockProvider[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setProvider(item);
                        void runSearch(item, query);
                      }}
                      className={cn(
                        "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                        provider === item ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900",
                      )}
                    >
                      {providerLabels[item]}
                    </button>
                  ))}
                </div>

                <div className="flex min-w-[180px] flex-1 gap-2">
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void runSearch(provider, query);
                      }
                    }}
                    placeholder="bureau, nature, portrait…"
                    className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => void runSearch(provider, query)}
                    disabled={isSearching}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {isSearching ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <Search className="size-3.5" />
                    )}
                    Chercher
                  </button>
                </div>
              </div>

              {searchMessage ? <p className="text-xs text-slate-500">{searchMessage}</p> : null}

              {photos.length > 0 ? (
                <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto pr-1">
                  {photos.map((photo) => (
                    <button
                      key={`${photo.provider}-${photo.id}`}
                      type="button"
                      onClick={() => void selectStockPhoto(photo)}
                      title={`${photo.description} — ${photo.authorName}`}
                      className="group relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-slate-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumbUrl}
                        alt={photo.description}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {pendingId === photo.id ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                          <LoaderCircle className="size-4 animate-spin text-slate-700" />
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

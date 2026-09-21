import { getStockPhotoEnv } from "@/lib/env";

export type StockPhotoProvider = "unsplash" | "pexels";

export const STOCK_PHOTO_PROVIDERS: Array<{ id: StockPhotoProvider; label: string; homepage: string }> = [
  { id: "unsplash", label: "Unsplash", homepage: "https://unsplash.com" },
  { id: "pexels", label: "Pexels", homepage: "https://www.pexels.com" },
];

export interface StockPhoto {
  id: string;
  provider: StockPhotoProvider;
  /** Vignette affichée dans la grille de résultats. */
  thumbUrl: string;
  /** Version haute définition utilisée pour générer le visuel final. */
  sourceUrl: string;
  description: string;
  authorName: string;
  authorUrl: string;
  photoUrl: string;
  /** Unsplash impose de notifier le téléchargement lors de l'utilisation d'une photo. */
  downloadLocation?: string;
}

type JsonRecord = Record<string, unknown>;

function readRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" ? (value as JsonRecord) : {};
}

function readString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function readRecordArray(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((item): item is JsonRecord => Boolean(item) && typeof item === "object")
    : [];
}

export function isStockProviderConfigured(provider: StockPhotoProvider) {
  const { unsplashAccessKey, pexelsApiKey } = getStockPhotoEnv();

  return provider === "unsplash" ? Boolean(unsplashAccessKey) : Boolean(pexelsApiKey);
}

export function getConfiguredStockProviders() {
  return STOCK_PHOTO_PROVIDERS.filter((provider) => isStockProviderConfigured(provider.id)).map(
    (provider) => provider.id,
  );
}

async function fetchProviderJson(url: string, headers: Record<string, string>, providerLabel: string) {
  const response = await fetch(url, { headers, cache: "no-store" });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Clé API ${providerLabel} invalide ou quota dépassé.`);
    }

    throw new Error(`${providerLabel} a répondu HTTP ${response.status}.`);
  }

  return readRecord(await response.json().catch(() => null));
}

async function searchUnsplash(query: string, page: number, perPage: number): Promise<StockPhoto[]> {
  const { unsplashAccessKey } = getStockPhotoEnv();
  const trimmedQuery = query.trim();
  const url = trimmedQuery
    ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(trimmedQuery)}&page=${page}&per_page=${perPage}&orientation=landscape`
    : `https://api.unsplash.com/photos?page=${page}&per_page=${perPage}&order_by=popular`;

  const payload = await fetchProviderJson(
    url,
    { Authorization: `Client-ID ${unsplashAccessKey}`, "Accept-Version": "v1" },
    "Unsplash",
  );

  // `/search/photos` renvoie un objet { results }, `/photos` renvoie un tableau.
  const rawItems = Array.isArray(payload) ? readRecordArray(payload) : readRecordArray(payload.results);

  return rawItems.map((item) => {
    const urls = readRecord(item.urls);
    const user = readRecord(item.user);
    const userLinks = readRecord(user.links);
    const links = readRecord(item.links);

    return {
      id: String(item.id),
      provider: "unsplash" as const,
      thumbUrl: readString(urls.small) ?? readString(urls.thumb) ?? "",
      sourceUrl: readString(urls.regular) ?? readString(urls.full) ?? "",
      description: readString(item.alt_description) ?? readString(item.description) ?? "Photo Unsplash",
      authorName: readString(user.name) ?? "Photographe Unsplash",
      authorUrl: readString(userLinks.html) ?? "https://unsplash.com",
      photoUrl: readString(links.html) ?? "https://unsplash.com",
      downloadLocation: readString(links.download_location),
    };
  });
}

async function searchPexels(query: string, page: number, perPage: number): Promise<StockPhoto[]> {
  const { pexelsApiKey } = getStockPhotoEnv();
  const trimmedQuery = query.trim();
  const url = trimmedQuery
    ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(trimmedQuery)}&page=${page}&per_page=${perPage}&orientation=landscape`
    : `https://api.pexels.com/v1/curated?page=${page}&per_page=${perPage}`;

  const payload = await fetchProviderJson(url, { Authorization: pexelsApiKey }, "Pexels");

  return readRecordArray(payload.photos).map((item) => {
    const src = readRecord(item.src);

    return {
      id: String(item.id),
      provider: "pexels" as const,
      thumbUrl: readString(src.medium) ?? readString(src.small) ?? "",
      sourceUrl: readString(src.large2x) ?? readString(src.large) ?? readString(src.original) ?? "",
      description: readString(item.alt) || "Photo Pexels",
      authorName: readString(item.photographer) ?? "Photographe Pexels",
      authorUrl: readString(item.photographer_url) ?? "https://www.pexels.com",
      photoUrl: readString(item.url) ?? "https://www.pexels.com",
    };
  });
}

export async function searchStockPhotos(input: {
  provider: StockPhotoProvider;
  query: string;
  page?: number;
  perPage?: number;
}): Promise<StockPhoto[]> {
  const page = Math.max(1, input.page ?? 1);
  const perPage = Math.min(30, Math.max(1, input.perPage ?? 24));
  const photos =
    input.provider === "unsplash"
      ? await searchUnsplash(input.query, page, perPage)
      : await searchPexels(input.query, page, perPage);

  return photos.filter((photo) => photo.thumbUrl && photo.sourceUrl);
}

/** Notifie Unsplash de l'utilisation d'une photo (exigence de leurs conditions d'API). */
export async function trackUnsplashDownload(downloadLocation: string) {
  const { unsplashAccessKey } = getStockPhotoEnv();

  if (!unsplashAccessKey || !downloadLocation.startsWith("https://api.unsplash.com/")) {
    return;
  }

  await fetch(downloadLocation, {
    headers: { Authorization: `Client-ID ${unsplashAccessKey}`, "Accept-Version": "v1" },
    cache: "no-store",
  }).catch(() => null);
}

import { getAdminSession } from "@/lib/auth";
import {
  getConfiguredStockProviders,
  isStockProviderConfigured,
  searchStockPhotos,
  trackUnsplashDownload,
  type StockPhotoProvider,
} from "@/lib/stock-photos";

function parseProvider(value: string | null): StockPhotoProvider {
  return value === "pexels" ? "pexels" : "unsplash";
}

export async function GET(request: Request) {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const provider = parseProvider(searchParams.get("provider"));
  const query = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const configuredProviders = getConfiguredStockProviders();

  if (!isStockProviderConfigured(provider)) {
    return Response.json({
      configured: false,
      configuredProviders,
      photos: [],
      error:
        provider === "unsplash"
          ? "Clé Unsplash absente : ajoutez UNSPLASH_ACCESS_KEY à votre environnement."
          : "Clé Pexels absente : ajoutez PEXELS_API_KEY à votre environnement.",
    });
  }

  try {
    const photos = await searchStockPhotos({
      provider,
      query,
      page: Number.isFinite(page) ? page : 1,
    });

    return Response.json({ configured: true, configuredProviders, photos });
  } catch (error) {
    return Response.json(
      {
        configured: true,
        configuredProviders,
        photos: [],
        error: error instanceof Error ? error.message : "Recherche impossible.",
      },
      { status: 502 },
    );
  }
}

/** Notification d'utilisation exigée par les conditions de l'API Unsplash. */
export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const downloadLocation =
    payload && typeof payload === "object" && "downloadLocation" in payload
      ? String((payload as Record<string, unknown>).downloadLocation ?? "")
      : "";

  if (downloadLocation) {
    await trackUnsplashDownload(downloadLocation);
  }

  return Response.json({ success: true });
}

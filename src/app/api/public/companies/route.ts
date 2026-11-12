import type { CompanySuggestion } from "@/lib/company";

/**
 * Recherche d'entreprises par nom ou par SIREN.
 *
 * S'appuie sur l'API publique et gratuite « Recherche d'entreprises » de l'État
 * (https://recherche-entreprises.api.gouv.fr), sans clé. Le site passe par
 * cette route plutôt que d'appeler l'API depuis le navigateur : les réponses
 * sont mises en cache une journée et le format renvoyé reste minimal.
 */
const SEARCH_ENDPOINT = "https://recherche-entreprises.api.gouv.fr/search";

export async function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 80);

  if (query.length < 3) {
    return Response.json({ results: [] });
  }

  try {
    const response = await fetch(`${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&per_page=6&page=1`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      return Response.json({ results: [], unavailable: true });
    }

    const data = (await response.json()) as {
      results?: Array<{
        siren?: string;
        nom_complet?: string;
        nom_raison_sociale?: string;
        siege?: { code_postal?: string; libelle_commune?: string };
      }>;
    };

    const results: CompanySuggestion[] = (data.results ?? [])
      .filter((item) => item.siren && (item.nom_complet || item.nom_raison_sociale))
      .map((item) => ({
        name: String(item.nom_complet || item.nom_raison_sociale),
        siren: String(item.siren),
        location: [item.siege?.code_postal, item.siege?.libelle_commune].filter(Boolean).join(" "),
      }));

    return Response.json({ results }, { headers: { "Cache-Control": "public, max-age=300, s-maxage=86400" } });
  } catch {
    // Annuaire injoignable : la saisie manuelle reste possible.
    return Response.json({ results: [], unavailable: true });
  }
}

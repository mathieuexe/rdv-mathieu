import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Sert les visuels de catégorie stockés en base (data URL) comme de vrais
 * fichiers image. Sans cette route, chaque visuel serait inséré en base64 dans
 * le HTML de la page : plusieurs centaines de kilo-octets par image, à chaque
 * visite, sans aucune mise en cache possible.
 *
 * La réponse est immuable : le dernier segment de l'URL est une empreinte qui
 * change dès que la catégorie est modifiée. Elle est dans le chemin et non en
 * query string, car l'optimiseur d'images de Next refuse les URL internes
 * paramétrées — or c'est lui qui convertit le JPEG en WebP redimensionné.
 */

const columnsByKind: Record<string, string> = {
  thumbnail: "thumbnail_image_url",
  banner: "banner_image_url",
};

function parseDataUrl(value: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/.exec(value);

  if (!match) {
    return null;
  }

  return { contentType: match[1], buffer: Buffer.from(match[2], "base64") };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; kind: string; version: string }> },
) {
  const { id, kind } = await context.params;
  const column = columnsByKind[kind];

  if (!column) {
    return new Response("Not found", { status: 404 });
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return new Response("Not found", { status: 404 });
  }

  const { data } = await supabase.from("categories").select(column).eq("id", id).maybeSingle();
  const value = data ? (data as unknown as Record<string, unknown>)[column] : null;

  if (typeof value !== "string" || !value) {
    return new Response("Not found", { status: 404 });
  }

  // Visuel déjà hébergé ailleurs : on renvoie simplement vers la source.
  if (/^https?:\/\//i.test(value)) {
    return Response.redirect(value, 308);
  }

  const parsed = parseDataUrl(value);

  if (!parsed) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(parsed.buffer), {
    headers: {
      "Content-Type": parsed.contentType,
      "Content-Length": String(parsed.buffer.byteLength),
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}

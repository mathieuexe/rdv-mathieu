import { getAdminSession } from "@/lib/auth";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

/** Empêche l'utilisation du proxy pour atteindre le réseau interne. */
function isPrivateHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return true;
  }

  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:")) {
    return true;
  }

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

  if (!ipv4) {
    return false;
  }

  const [first, second] = [Number(ipv4[1]), Number(ipv4[2])];

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

/**
 * Relaie une image distante (banque d'images ou URL collée) sur notre origine,
 * afin que l'administration puisse la recadrer dans un canvas sans être bloquée
 * par CORS.
 */
export async function GET(request: Request) {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const target = new URL(request.url).searchParams.get("url") ?? "";
  let parsedTarget: URL;

  try {
    parsedTarget = new URL(target);
  } catch {
    return Response.json({ error: "URL invalide." }, { status: 400 });
  }

  if (parsedTarget.protocol !== "https:" || isPrivateHostname(parsedTarget.hostname)) {
    return Response.json({ error: "Seules les URL https publiques sont acceptées." }, { status: 400 });
  }

  const upstream = await fetch(parsedTarget, {
    headers: { Accept: "image/*" },
    redirect: "follow",
    cache: "no-store",
  }).catch(() => null);

  if (!upstream?.ok) {
    return Response.json({ error: "Image inaccessible à cette adresse." }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "";

  if (!contentType.startsWith("image/")) {
    return Response.json({ error: "Cette adresse ne pointe pas vers une image." }, { status: 415 });
  }

  const buffer = await upstream.arrayBuffer();

  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    return Response.json({ error: "Image trop volumineuse (15 Mo maximum)." }, { status: 413 });
  }

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
    },
  });
}

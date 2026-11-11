import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getPublicSupabaseEnv, isSupabaseConfigured } from "@/lib/env";
import { extractClientIpFromHeaders, isMaintenanceBypassedForIp, normalizeAllowedIps } from "@/lib/maintenance";
import type { SiteSettings } from "@/types/domain";

/**
 * Le middleware s'exécute avant *chaque* page : chaque appel réseau qu'il fait
 * s'ajoute au temps d'affichage. Deux garde-fous ici :
 *  - la vérification de session n'a lieu que si un cookie d'authentification
 *    existe (un visiteur anonyme ne paie aucun aller-retour) ;
 *  - les réglages du site sont gardés en mémoire quelques secondes par
 *    instance, au lieu d'une requête base à chaque navigation.
 */

const SETTINGS_CACHE_TTL_MS = 30_000;

type MaintenanceSettings = Pick<
  SiteSettings,
  "maintenanceMode" | "maintenanceAllowedIps"
>;

let cachedSettings: { value: MaintenanceSettings; expiresAt: number } | null = null;

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return response;
  }

  const pathname = request.nextUrl.pathname;

  // Les routes API portent leur propre authentification.
  if (pathname.startsWith("/api")) {
    return response;
  }

  const { url, anonKey } = getPublicSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const isMaintenancePage = pathname === "/maintenance";
  const isSecurityPage = pathname === "/compte/securite";

  // Un seul appel au service d'authentification, et uniquement si une session
  // existe : il rafraîchit au passage les jetons de l'utilisateur connecté.
  const user = hasSupabaseAuthCookie(request) ? (await supabase.auth.getUser()).data.user : null;

  // L'administration vérifie ses propres droits côté serveur.
  if (pathname.startsWith("/admin")) {
    return response;
  }

  let settings = cachedSettings && cachedSettings.expiresAt > Date.now() ? cachedSettings.value : null;

  if (!settings) {
    const { data: settingsRow } = await supabase
      .from("site_settings")
      .select("maintenance_mode, maintenance_allowed_ips")
      .limit(1)
      .maybeSingle();

    settings = {
      maintenanceMode: Boolean(settingsRow?.maintenance_mode),
      maintenanceAllowedIps: normalizeAllowedIps(settingsRow?.maintenance_allowed_ips),
    };
    cachedSettings = { value: settings, expiresAt: Date.now() + SETTINGS_CACHE_TTL_MS };
  }

  const clientIp = extractClientIpFromHeaders(request.headers);
  const bypassMaintenance = isMaintenanceBypassedForIp(clientIp, settings as SiteSettings);

  if (!settings.maintenanceMode && isMaintenancePage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (settings.maintenanceMode && !bypassMaintenance && !isMaintenancePage) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  if (settings.maintenanceMode && bypassMaintenance && isMaintenancePage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (user?.id) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("requires_password_change")
      .eq("user_id", user.id)
      .maybeSingle();

    const requiresPasswordChange = Boolean(profile?.requires_password_change);

    if (requiresPasswordChange && !isSecurityPage && !isMaintenancePage) {
      return NextResponse.redirect(new URL("/compte/securite", request.url));
    }

    if (!requiresPasswordChange && isSecurityPage) {
      return NextResponse.redirect(new URL("/compte", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|mp3)$).*)"],
};

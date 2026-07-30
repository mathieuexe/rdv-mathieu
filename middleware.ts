import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getPublicSupabaseEnv, isSupabaseConfigured } from "@/lib/env";
import { extractClientIpFromHeaders, isMaintenanceBypassedForIp, normalizeAllowedIps } from "@/lib/maintenance";
import type { SiteSettings } from "@/types/domain";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  if (!isSupabaseConfigured()) {
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
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isApiRoute = pathname.startsWith("/api");
  const isMaintenancePage = pathname === "/maintenance";
  const isSecurityPage = pathname === "/compte/securite";

  if (isAdminRoute || isApiRoute) {
    return response;
  }

  const { data: settingsRow } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();

  const siteSettings: SiteSettings = {
    maintenanceMode: Boolean(settingsRow?.maintenance_mode),
    maintenanceMessage: typeof settingsRow?.maintenance_message === "string" ? settingsRow.maintenance_message : "",
    maintenanceAllowedIps: normalizeAllowedIps(settingsRow?.maintenance_allowed_ips),
    enableWhatsappWidget: Boolean(settingsRow?.enable_whatsapp_widget),
    enableBlackoutMarquee: settingsRow?.enable_blackout_marquee !== false,
    globalBlackoutPeriods: [],
  };

  const clientIp = extractClientIpFromHeaders(request.headers);
  const bypassMaintenance = isMaintenanceBypassedForIp(clientIp, siteSettings);

  if (!siteSettings.maintenanceMode && isMaintenancePage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (siteSettings.maintenanceMode && !bypassMaintenance && !isMaintenancePage) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  if (siteSettings.maintenanceMode && bypassMaintenance && isMaintenancePage) {
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
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)"],
};

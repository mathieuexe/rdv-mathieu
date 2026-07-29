import type { SiteSettings } from "@/types/domain";

export function normalizeClientIp(value?: string | null) {
  if (!value) {
    return "";
  }

  let normalized = value.trim();

  if (!normalized) {
    return "";
  }

  if (normalized.includes(",")) {
    normalized = normalized.split(",")[0]?.trim() ?? "";
  }

  if (normalized.startsWith("::ffff:")) {
    normalized = normalized.slice(7);
  }

  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    normalized = normalized.slice(1, -1);
  }

  return normalized;
}

export function extractClientIpFromHeaders(headers: Headers) {
  return (
    normalizeClientIp(headers.get("x-forwarded-for")) ||
    normalizeClientIp(headers.get("x-real-ip")) ||
    normalizeClientIp(headers.get("cf-connecting-ip")) ||
    null
  );
}

export function splitAllowedIpsInput(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\n,;]/)
        .map((item) => normalizeClientIp(item))
        .filter(Boolean),
    ),
  );
}

export function normalizeAllowedIps(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => (typeof item === "string" ? normalizeClientIp(item) : ""))
        .filter(Boolean),
    ),
  );
}

export function mergeAllowedIps(ips: string[], extraIps: Array<string | null | undefined>) {
  return Array.from(new Set([...ips, ...extraIps.map((item) => normalizeClientIp(item)).filter(Boolean)]));
}

export function isMaintenanceBypassedForIp(ip: string | null, settings: SiteSettings) {
  if (!settings.maintenanceMode) {
    return true;
  }

  if (!ip) {
    return false;
  }

  const normalizedIp = normalizeClientIp(ip);
  return settings.maintenanceAllowedIps.includes(normalizedIp);
}

export function isMaintenanceBypassedForHeaders(headers: Headers, settings: SiteSettings) {
  return isMaintenanceBypassedForIp(extractClientIpFromHeaders(headers), settings);
}

export function getEffectiveSiteSettings(settings: SiteSettings, bypassMaintenance: boolean): SiteSettings {
  if (!bypassMaintenance) {
    return settings;
  }

  return {
    ...settings,
    maintenanceMode: false,
  };
}

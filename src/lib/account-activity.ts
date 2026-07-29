import { normalizeClientIp } from "@/lib/maintenance";

function detectDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (!ua) {
    return "";
  }

  if (ua.includes("ipad") || ua.includes("tablet")) {
    return "Tablette";
  }

  if (
    ua.includes("mobile") ||
    ua.includes("iphone") ||
    ua.includes("android") ||
    ua.includes("windows phone")
  ) {
    return "Mobile";
  }

  return "Ordinateur";
}

function detectOperatingSystem(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (!ua) {
    return "";
  }

  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) {
    return "iOS";
  }

  if (ua.includes("android")) {
    return "Android";
  }

  if (ua.includes("mac os x") || ua.includes("macintosh")) {
    return "macOS";
  }

  if (ua.includes("windows")) {
    return "Windows";
  }

  if (ua.includes("linux")) {
    return "Linux";
  }

  return "Système inconnu";
}

function detectBrowser(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (!ua) {
    return "";
  }

  if (ua.includes("edg/")) {
    return "Microsoft Edge";
  }

  if (ua.includes("opr/") || ua.includes("opera")) {
    return "Opera";
  }

  if (ua.includes("chrome/") && !ua.includes("edg/") && !ua.includes("opr/")) {
    return "Google Chrome";
  }

  if (ua.includes("firefox/")) {
    return "Mozilla Firefox";
  }

  if (ua.includes("safari/") && !ua.includes("chrome/")) {
    return "Safari";
  }

  return "Navigateur inconnu";
}

export interface ClientContext {
  ipAddress?: string;
  country?: string;
  region?: string;
  city?: string;
  deviceType?: string;
  operatingSystem?: string;
  browser?: string;
  userAgent?: string;
}

export function extractClientContextFromHeaders(headers: Headers): ClientContext {
  const userAgent = headers.get("user-agent")?.trim() ?? "";
  const ipAddress =
    normalizeClientIp(headers.get("x-forwarded-for")) ||
    normalizeClientIp(headers.get("x-real-ip")) ||
    normalizeClientIp(headers.get("cf-connecting-ip")) ||
    "";
  const country = headers.get("x-vercel-ip-country")?.trim() ?? "";
  const region = headers.get("x-vercel-ip-country-region")?.trim() ?? "";
  const city = headers.get("x-vercel-ip-city")?.trim() ?? "";

  return {
    ipAddress: ipAddress || undefined,
    country: country || undefined,
    region: region || undefined,
    city: city || undefined,
    deviceType: detectDeviceType(userAgent) || undefined,
    operatingSystem: detectOperatingSystem(userAgent) || undefined,
    browser: detectBrowser(userAgent) || undefined,
    userAgent: userAgent || undefined,
  };
}

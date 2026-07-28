const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim();
const publicSupabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

function isValidHttpUrl(value?: string) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSupabaseConfigured() {
  return isValidHttpUrl(publicSupabaseUrl) && Boolean(publicSupabaseAnonKey);
}

export function isAdminSupabaseConfigured() {
  return isValidHttpUrl(publicSupabaseUrl) && Boolean(serviceRoleKey);
}

export function getPublicSupabaseEnv() {
  return {
    url: publicSupabaseUrl ?? "",
    anonKey: publicSupabaseAnonKey ?? "",
  };
}

export function getSupabaseConfigError() {
  if (!publicSupabaseUrl) {
    return "URL Supabase manquante.";
  }

  if (!isValidHttpUrl(publicSupabaseUrl)) {
    return "URL Supabase invalide.";
  }

  if (!publicSupabaseAnonKey) {
    return "Clé publique Supabase manquante.";
  }

  return null;
}

export function getServiceRoleEnv() {
  return {
    url: publicSupabaseUrl ?? "",
    serviceRoleKey: serviceRoleKey ?? "",
  };
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.toLowerCase() ?? "admin@example.com";
}

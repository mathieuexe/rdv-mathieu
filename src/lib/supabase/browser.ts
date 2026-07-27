import { createBrowserClient } from "@supabase/ssr";

import { getPublicSupabaseEnv, isSupabaseConfigured } from "@/lib/env";

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = getPublicSupabaseEnv();
  return createBrowserClient(url, anonKey);
}

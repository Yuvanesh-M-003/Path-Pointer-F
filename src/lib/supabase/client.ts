import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "@/lib/env";

/**
 * Browser Supabase client (singleton).
 * Returns `null` when credentials are not configured yet, so the app can
 * still boot and show the authentication architecture without crashing.
 */
let cached: SupabaseClient | null | undefined;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  if (!isSupabaseConfigured) {
    cached = null;
    return cached;
  }

  cached = createClient(env.supabaseUrl as string, env.supabaseKey as string, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "path-pointer-auth",
      flowType: "pkce",
    },
  });

  return cached;
}

/** Redirect target used by the Google OAuth flow. */
export const OAUTH_REDIRECT_PATH = "/auth/callback";

export function oauthRedirectUrl() {
  const base = env.siteUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base.replace(/\/$/, "")}${OAUTH_REDIRECT_PATH}`;
}

/**
 * Path Pointer — frontend environment configuration.
 *
 * This project is a Vite SPA, so public env vars use the `VITE_` prefix.
 * (If you port this to Next.js App Router, the equivalents are the
 *  NEXT_PUBLIC_* variables noted next to each key.)
 *
 * .env.local
 * ------------------------------------------------------------------
 * VITE_SUPABASE_URL=                (NEXT_PUBLIC_SUPABASE_URL)
 * VITE_SUPABASE_PUBLISHABLE_KEY=    (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
 * VITE_API_BASE_URL=                (NEXT_PUBLIC_API_BASE_URL) e.g. https://api.pathpointer.dev
 * VITE_SITE_URL=                    (NEXT_PUBLIC_SITE_URL) used for the OAuth redirect
 * ------------------------------------------------------------------
 *
 * NEVER place service-role keys or database credentials in this file.
 */

const raw = (import.meta as unknown as { env: Record<string, string | undefined> }).env ?? {};

const clean = (value?: string) => {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : undefined;
};

export const env = {
  supabaseUrl: clean(raw.VITE_SUPABASE_URL),
  supabaseKey: clean(raw.VITE_SUPABASE_PUBLISHABLE_KEY) ?? clean(raw.VITE_SUPABASE_ANON_KEY),
  apiBaseUrl: clean(raw.VITE_API_BASE_URL)?.replace(/\/$/, ""),
  siteUrl: clean(raw.VITE_SITE_URL) ?? (typeof window !== "undefined" ? window.location.origin : ""),
  previewModeEnabled: clean(raw.VITE_ENABLE_PREVIEW_MODE) === "true",
};

/** True when Supabase Auth credentials are wired up. */
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseKey);

/** True when the Path Pointer backend base URL is wired up. */
export const isApiConfigured = Boolean(env.apiBaseUrl);

/**
 * Preview mode is opt-in only; it must not auto-activate when backend data is absent.
 * Development should use real Supabase auth by default, with preview fixtures only
 * when `VITE_ENABLE_PREVIEW_MODE=true` is explicitly set.
 */
export const isPreviewMode = env.previewModeEnabled;

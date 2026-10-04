import { useState } from "react";
import { PlugZap, X } from "lucide-react";
import { isApiConfigured, isSupabaseConfigured } from "@/lib/env";

/**
 * Shown while the backend / Supabase env vars are missing so nobody mistakes
 * the isolated preview fixtures for real production analytics.
 */
export function PreviewBanner() {
  const [hidden, setHidden] = useState(false);
  if ((isApiConfigured && isSupabaseConfigured) || hidden) return null;

  const missing = [
    !isApiConfigured && "VITE_API_BASE_URL",
    !isSupabaseConfigured && "VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY",
  ].filter(Boolean);

  return (
    <div className="relative z-40 flex items-start gap-2.5 border-b border-accent-500/20 bg-accent-500/[0.07] px-4 py-2 text-[12px] leading-relaxed text-accent-200 sm:items-center sm:px-6">
      <PlugZap className="mt-0.5 size-4 shrink-0 text-accent-400 sm:mt-0" aria-hidden />
      <p className="flex-1">
        <span className="font-semibold text-accent-300">Preview mode.</span> Backend not connected — set{" "}
        <code className="rounded bg-black/25 px-1 py-0.5 font-mono text-[11px]">{missing.join(" · ")}</code> in{" "}
        <code className="rounded bg-black/25 px-1 py-0.5 font-mono text-[11px]">.env.local</code> to load real Path
        Pointer data.
      </p>
      <button
        onClick={() => setHidden(true)}
        aria-label="Dismiss preview notice"
        className="rounded p-1 text-accent-300/70 transition-colors hover:bg-black/20 hover:text-accent-200"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

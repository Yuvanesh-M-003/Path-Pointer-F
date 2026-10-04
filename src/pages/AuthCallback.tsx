import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getProfile } from "@/lib/api/endpoints";
import { FullPageLoader } from "@/components/common/FullPageLoader";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/common/Button";

/**
 * OAuth callback: Supabase parses the code/hash, we then read the profile and
 * route the user to /onboarding or /dashboard. Equivalent of
 * `app/auth/callback/route.ts` in a Next.js App Router setup.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const supabase = getSupabaseBrowserClient();

      if (supabase) {
        const url = new URL(window.location.href);
        const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
        const hashParams = new URLSearchParams(hash.includes("?") ? hash.split("?")[1] ?? "" : hash);
        const oauthError =
          url.searchParams.get("error_description") ??
          url.searchParams.get("error") ??
          hashParams.get("error_description") ??
          hashParams.get("error");

        if (oauthError) {
          if (!cancelled) setError(oauthError);
          return;
        }

        // The browser client already created and persisted the PKCE verifier.
        // Do not exchange the OAuth code a second time here; Supabase handles
        // the callback automatically when detectSessionInUrl is enabled.
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError && !cancelled) {
          setError(sessionError.message);
          return;
        }
        if (!data.session) {
          if (!cancelled) setError("We couldn't complete the Google sign-in. Please try again.");
          return;
        }

        if (window.history.replaceState) {
          const nextUrl = `${window.location.pathname}`;
          window.history.replaceState({}, "", nextUrl);
        }
      }

      try {
        const profile = await getProfile();
        if (!cancelled) navigate(profile.onboarding_completed ? "/dashboard" : "/onboarding", { replace: true });
      } catch {
        // Backend unreachable → still let the guard decide.
        if (!cancelled) navigate("/onboarding", { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-6">
        <div className="w-full">
          <ErrorState title="Sign-in failed" description={error} />
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={() => navigate("/login", { replace: true })}>
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <FullPageLoader label="Completing sign-in…" />;
}

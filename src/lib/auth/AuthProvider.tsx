import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, oauthRedirectUrl } from "@/lib/supabase/client";
import { isPreviewMode, isSupabaseConfigured } from "@/lib/env";
import { setUnauthorizedHandler } from "@/lib/api/client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  session: Session | null;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  isPreviewSession: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(session: Session | null): AuthUser | null {
  if (!session?.user) return null;
  const meta = (session.user.user_metadata ?? {}) as Record<string, string>;
  return {
    id: session.user.id,
    email: session.user.email ?? meta.email ?? "",
    name: meta.full_name ?? meta.name ?? session.user.email?.split("@")[0] ?? "Developer",
    avatarUrl: meta.avatar_url ?? meta.picture ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /* ------------------------------ bootstrapping ----------------------------- */
  useEffect(() => {
    if (!supabase) {
      setSession(null);
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    let active = true;
    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) setError(sessionError.message);
        setSession(data.session ?? null);
        setUser(mapUser(data.session ?? null));
        setStatus(data.session ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!active) return;
        setError("We couldn't verify your session.");
        setStatus("unauthenticated");
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(mapUser(newSession));
      setStatus(newSession ? "authenticated" : "unauthenticated");
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    if (!supabase) {
      const message = "Google OAuth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.";
      setError(message);
      throw new Error(message);
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: oauthRedirectUrl(),
      },
    });
    if (oauthError) {
      setError(
        oauthError.message.includes("provider")
          ? "Google sign-in isn't enabled for this Supabase project yet."
          : oauthError.message,
      );
      throw oauthError;
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setStatus("unauthenticated");
  }, [supabase]);

  /* 401 from the API layer → re-validate the session. */
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setError("Your session expired. Please sign in again.");
      void signOut();
    });
  }, [signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      session,
      error,
      signInWithGoogle,
      signOut,
      clearError: () => setError(null),
      isPreviewSession: isPreviewMode || !isSupabaseConfigured,
    }),
    [status, user, session, error, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

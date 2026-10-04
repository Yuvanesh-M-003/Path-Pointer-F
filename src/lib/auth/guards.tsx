import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useProfile } from "@/lib/api/queries";
import { FullPageLoader } from "@/components/common/FullPageLoader";
import { ErrorState } from "@/components/common/ErrorState";

/** Blocks /dashboard/* and /onboarding for unauthenticated visitors. */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullPageLoader label="Checking your session…" />;
  if (status === "unauthenticated") return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Dashboard routes: requires a completed onboarding record. */
export function RequireOnboarded() {
  const { data: profile, isLoading, isError, refetch } = useProfile();

  if (isLoading) return <FullPageLoader label="Loading your workspace…" />;
  if (isError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-6">
        <ErrorState
          title="We couldn't load your profile"
          description="Path Pointer couldn't reach the backend to verify your account."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

/** /onboarding: only for authenticated users who haven't finished it. */
export function RequireIncompleteOnboarding() {
  const { data: profile, isLoading, isError, refetch } = useProfile();

  if (isLoading) return <FullPageLoader label="Preparing onboarding…" />;
  if (isError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-6">
        <ErrorState
          title="We couldn't load your profile"
          description="Path Pointer couldn't reach the backend to verify your account."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }
  if (profile?.onboarding_completed) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/** Landing / login: authenticated users go straight to the right place. */
export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const { data: profile, isLoading } = useProfile(status === "authenticated");

  if (status === "loading") return <FullPageLoader label="Loading Path Pointer…" />;
  if (status === "authenticated") {
    if (isLoading) return <FullPageLoader label="Loading Path Pointer…" />;
    return <Navigate to={profile?.onboarding_completed ? "/dashboard" : "/onboarding"} replace />;
  }
  return <>{children}</>;
}

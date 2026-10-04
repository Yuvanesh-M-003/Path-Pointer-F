import { Component, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { RequireAuth, RequireIncompleteOnboarding, RequireOnboarded, RedirectIfAuthenticated } from "@/lib/auth/guards";
import { ToastProvider } from "@/components/common/Toast";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/common/Button";
import { Logo } from "@/components/common/Logo";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ApiError } from "@/lib/api/client";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Onboarding from "@/pages/Onboarding";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import ProblemsPage from "@/pages/dashboard/ProblemsPage";
import RecommendationsPage from "@/pages/dashboard/RecommendationsPage";
import ProgressPage from "@/pages/dashboard/ProgressPage";
import AnalyticsPage from "@/pages/dashboard/AnalyticsPage";
import RoadmapPage from "@/pages/dashboard/RoadmapPage";
import Top150Page from "@/pages/dashboard/Top150Page";
import NotificationsPage from "@/pages/dashboard/NotificationsPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && [400, 401, 403, 404, 409, 422].includes(error.status)) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: { retry: 0 },
  },
});

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-navy-900 px-6">
          <div className="w-full max-w-lg">
            <ErrorState
              title="Something went wrong."
              description="An unexpected error occurred in the interface. Reloading usually fixes it."
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-navy-900 px-6 text-center">
      <Logo size={34} showTagline />
      <div>
        <p className="font-mono text-[13px] text-accent-500">404</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">This path doesn't exist</h1>
        <p className="mt-2 text-[14px] text-slate-400">The page you're looking for isn't part of Path Pointer.</p>
      </div>
      <Link to="/">
        <Button variant="secondary">Back to home</Button>
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route
                  path="/"
                  element={
                    <RedirectIfAuthenticated>
                      <Landing />
                    </RedirectIfAuthenticated>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <RedirectIfAuthenticated>
                      <Login />
                    </RedirectIfAuthenticated>
                  }
                />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* protected */}
                <Route element={<RequireAuth />}>
                  <Route element={<RequireIncompleteOnboarding />}>
                    <Route path="/onboarding" element={<Onboarding />} />
                  </Route>

                  <Route element={<RequireOnboarded />}>
                    <Route path="/dashboard" element={<DashboardLayout />}>
                      <Route index element={<DashboardHome />} />
                      <Route path="roadmap" element={<RoadmapPage />} />
                      <Route path="problems" element={<ProblemsPage />} />
                      <Route path="recommendations" element={<RecommendationsPage />} />
                      <Route path="progress" element={<ProgressPage />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="top-150" element={<Top150Page />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="/index.html" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

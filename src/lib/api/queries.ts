import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./endpoints";
import type { ProblemFilters } from "./endpoints";
import type { OnboardingPayload } from "./types";

export const qk = {
  profile: ["profile"] as const,
  topics: ["topics"] as const,
  dashboard: ["dashboard"] as const,
  progress: ["progress"] as const,
  mastery: ["mastery"] as const,
  analytics: ["analytics"] as const,
  recommendations: ["recommendations"] as const,
  problems: (f: ProblemFilters) => ["problems", f] as const,
  top150: ["top-150"] as const,
  roadmap: ["roadmap"] as const,
  notifications: ["notifications"] as const,
};

const STALE = 60_000;

export const useProfile = (enabled = true) =>
  useQuery({ queryKey: qk.profile, queryFn: api.getProfile, enabled, staleTime: STALE });

export const useTopics = () => useQuery({ queryKey: qk.topics, queryFn: api.getTopics, staleTime: 10 * 60_000 });

export const useDashboard = () => useQuery({ queryKey: qk.dashboard, queryFn: api.getDashboard, staleTime: 30_000 });

export const useProgress = () => useQuery({ queryKey: qk.progress, queryFn: api.getProgress, staleTime: STALE });

export const useMastery = () => useQuery({ queryKey: qk.mastery, queryFn: api.getMastery, staleTime: STALE });

export const useAnalytics = () => useQuery({ queryKey: qk.analytics, queryFn: api.getAnalytics, staleTime: STALE });

export const useRecommendations = () =>
  useQuery({ queryKey: qk.recommendations, queryFn: api.getRecommendations, staleTime: 30_000 });

export const useProblems = (filters: ProblemFilters) =>
  useQuery({ queryKey: qk.problems(filters), queryFn: () => api.getProblems(filters), staleTime: 30_000 });

export const useTop150 = () => useQuery({ queryKey: qk.top150, queryFn: api.getTop150, staleTime: STALE });

export const useRoadmap = () => useQuery({ queryKey: qk.roadmap, queryFn: api.getRoadmap, staleTime: STALE });

export const useNotifications = () =>
  useQuery({ queryKey: qk.notifications, queryFn: api.getNotifications, staleTime: 20_000 });

/** After any mutation we re-fetch authoritative backend data. */
function useInvalidateProgressGraph() {
  const qc = useQueryClient();
  return () => {
    [qk.dashboard, qk.progress, qk.mastery, qk.analytics, qk.recommendations, qk.top150, qk.roadmap, qk.notifications].forEach(
      (key) => qc.invalidateQueries({ queryKey: key }),
    );
    qc.invalidateQueries({ queryKey: ["problems"] });
  };
}

export function useSolveProblem() {
  const invalidate = useInvalidateProgressGraph();
  return useMutation({
    mutationFn: (problemId: string) => api.solveProblem(problemId),
    onSuccess: invalidate,
  });
}

export function useUpdateRoadmapProgress() {
  const invalidate = useInvalidateProgressGraph();
  return useMutation({
    mutationFn: api.updateRoadmapProgress,
    onSuccess: invalidate,
  });
}

export function useSubmitOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OnboardingPayload) => api.submitOnboarding(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.profile });
      qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.profile }),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications }),
  });
}

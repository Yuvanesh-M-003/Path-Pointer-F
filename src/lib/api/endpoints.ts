/**
 * Centralised Path Pointer API layer.
 * Every backend interaction in the app goes through the functions below.
 *
 * Expected REST contract (adjust the paths here only — never in components):
 *
 *  GET    /api/profile                         -> Profile
 *  PATCH  /api/profile                         -> Profile
 *  GET    /api/topics                          -> Topic[]
 *  POST   /api/onboarding                      -> { profile: Profile }
 *  GET    /api/dashboard                       -> DashboardSummary
 *  GET    /api/progress                        -> ProgressSnapshot
 *  GET    /api/mastery                         -> TopicMastery[]
 *  GET    /api/analytics                       -> AnalyticsResponse
 *  GET    /api/recommendations                 -> Recommendation[]
 *  GET    /api/problems?search&topic_id&difficulty&status&page -> Paginated<Problem>
 *  POST   /api/problems/:problemId/solve       -> { ok: true }        (409 when duplicate)
 *  GET    /api/top-150                         -> Top150Response
 *  GET    /api/roadmap                         -> RoadmapResponse
 *  POST   /api/roadmap/progress                -> { ok: true }
 *  GET    /api/notifications                   -> AppNotification[]
 *  POST   /api/notifications/:id/read          -> { ok: true }
 *  POST   /api/notifications/read-all          -> { ok: true }
 */
import { apiRequest } from "./client";
import { isPreviewMode } from "@/lib/env";
import * as preview from "./preview-fixtures";
import type {
  AnalyticsResponse,
  AppNotification,
  DashboardSummary,
  OnboardingPayload,
  Paginated,
  Problem,
  Profile,
  ProgressSnapshot,
  Recommendation,
  RoadmapResponse,
  Top150Response,
  Topic,
  TopicMastery,
} from "./types";

const delay = (ms = 320) => new Promise((r) => setTimeout(r, ms));
const PREVIEW_ONBOARDED_KEY = "pp-preview-onboarded";

/**
 * Add IANA timezone to a GET endpoint URL to help backend determine "today" correctly.
 * Timezone is appended as a query parameter (e.g., /api/dashboard?timezone=America/New_York).
 * @param path - The API path (may already contain query parameters)
 * @returns The path with timezone query parameter appended
 */
function withTimezone(path: string): string {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}timezone=${encodeURIComponent(timezone)}`;
}

/**
 * Adapter: normalize backend profile to frontend type.
 * Backend sends either 'name' or 'full_name'; we always expect snake_case via normalization layer.
 */
function toFrontendProfile(raw: any): Profile {
  return {
    id: raw.id,
    email: raw.email ?? "",
    full_name: raw.full_name ?? null,
    avatar_url: raw.avatar_url ?? null,
    leetcode_username: raw.leetcode_username ?? null,
    onboarding_completed: Boolean(raw.onboarding_completed ?? false),
    created_at: raw.created_at,
  };
}

/**
 * Adapter: normalize backend topic to frontend type.
 * After normalization layer, all keys are snake_case.
 */
function toFrontendTopic(raw: any): Topic {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    order_index: raw.order_index,
    subtopics: (raw.subtopics ?? []).map((sub: any) => ({
      id: sub.id,
      topic_id: sub.topic_id ?? raw.id,
      name: sub.name,
    })),
  };
}

/**
 * Adapter: normalize backend mastery to frontend type.
 * After normalization layer, all keys are snake_case.
 */
function toFrontendMastery(raw: any): TopicMastery {
  return {
    topic_id: raw.topic_id ?? raw.id,
    topic_name: raw.topic_name ?? raw.name ?? "Unknown",
    solved_count: Number(raw.solved_count ?? 0),
    coverage_score: Number(raw.coverage_score ?? 0),
    difficulty_score: Number(raw.difficulty_score ?? 0),
    consistency_score: Number(raw.consistency_score ?? 0),
    self_assessment_score: Number(raw.self_assessment_score ?? 0),
    mastery_score: Number(raw.mastery_score ?? 0),
    is_weak: Boolean(raw.is_weak ?? false),
  };
}

/**
 * Adapter: normalize backend problem to frontend type.
 * After normalization layer, all keys are snake_case.
 */
function toFrontendProblem(raw: any): Problem {
  return {
    id: raw.id,
    title: raw.title,
    url: raw.url ?? "",
    difficulty: raw.difficulty,
    topic_id: raw.topic_id ?? null,
    topic_name: raw.topic ?? null,
    subtopic_name: raw.subtopic ?? null,
    is_solved: Boolean(raw.solved ?? false),
    solved_at: raw.solved_at ?? null,
  };
}

/**
 * Adapter: normalize backend notification to frontend type.
 * After normalization layer, all keys are snake_case.
 */
function toFrontendNotification(raw: any): AppNotification {
  return {
    id: raw.id,
    type: raw.type,
    title: raw.title,
    body: raw.body ?? raw.message ?? "",
    read: Boolean(raw.read ?? false),
    created_at: raw.created_at ?? new Date().toISOString(),
  };
}

/* ---------------------------- profile & topics ---------------------------- */

export async function getProfile(): Promise<Profile> {
  if (isPreviewMode) {
    await delay();
    return {
      ...preview.previewProfile,
      onboarding_completed:
        typeof window !== "undefined" && window.localStorage.getItem(PREVIEW_ONBOARDED_KEY) === "1",
    };
  }
  const data = await apiRequest<any>("/api/profile");
  return toFrontendProfile(data);
}

export async function updateProfile(patch: Partial<Pick<Profile, "full_name" | "leetcode_username">>) {
  if (isPreviewMode) return delay().then(() => ({ ...preview.previewProfile, ...patch }));
  // Send snake_case to backend for consistency
  const body: Record<string, unknown> = {};
  if (patch.full_name !== undefined) body.full_name = patch.full_name;
  if (patch.leetcode_username !== undefined) body.leetcode_username = patch.leetcode_username;
  const data = await apiRequest<any>("/api/profile", { method: "PATCH", body });
  return toFrontendProfile(data);
}

export async function getTopics(): Promise<Topic[]> {
  if (isPreviewMode) return delay().then(() => preview.previewTopics);
  const data = await apiRequest<{ topics?: any[] }>("/api/topics");
  return (data?.topics ?? []).map(toFrontendTopic);
}

export async function submitOnboarding(payload: OnboardingPayload) {
  if (isPreviewMode) {
    await delay(900);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PREVIEW_ONBOARDED_KEY, "1");
      window.localStorage.setItem("pp-preview-leetcode", payload.leetcodeUsername ?? "");
    }
    return { profile: { ...preview.previewProfile, onboarding_completed: true } };
  }

  // Send snake_case to backend for consistency
  const body = {
    full_name: payload.name || "Path Pointer User",
    leetcode_username: payload.leetcodeUsername,
    easy_solved: payload.easySolved,
    medium_solved: payload.mediumSolved,
    hard_solved: payload.hardSolved,
    topic_ratings: payload.topicRatings.map((item) => ({
      topic_id: item.topicId,
      rating: item.rating,
    })),
  };

  const data = await apiRequest<any>("/api/onboarding", { method: "POST", body });
  return { profile: toFrontendProfile(data) };
}

/* ------------------------------- dashboard -------------------------------- */

export async function getDashboard(): Promise<DashboardSummary> {
  if (isPreviewMode) return delay().then(preview.previewDashboard);
  const data = await apiRequest<any>(withTimezone("/api/dashboard"));
  const today = data.today ?? {};

  return {
    profile: data.profile ? {
      full_name: data.profile.name ?? null,
      avatar_url: data.profile.avatar_url ?? null,
      leetcode_username: data.profile.leetcode_username ?? null,
    } : undefined,
    totals: {
      total: Number(data.solved_stats?.total?.overall ?? 0),
      baseline: Number(data.solved_stats?.baseline?.total ?? 0),
      path_pointer: Number(data.solved_stats?.tracked?.total ?? 0),
      easy: Number(data.solved_stats?.total?.easy ?? 0),
      medium: Number(data.solved_stats?.total?.medium ?? 0),
      hard: Number(data.solved_stats?.total?.hard ?? 0),
    },
    solved_today: Number(today.solved_count ?? 0),
    daily_goal: Number(today.daily_goal ?? 0),
    remaining_today: Number(today.remaining ?? 0),
    current_streak: Number(data.streak ?? 0),
    longest_streak: Number(data.longest_streak ?? 0),
    weekly: {
      solved: (data.weekly_progress ?? []).reduce((sum: number, day: any) => sum + Number(day.solved ?? 0), 0),
      goal: (data.weekly_progress ?? []).reduce((sum: number, day: any) => sum + Number(day.goal ?? 0), 0),
      days: (data.weekly_progress ?? []).map((day: any) => ({
        date: day.date,
        count: Number(day.solved ?? 0),
        goal: Number(day.goal ?? 0),
      })),
    },
    recent_activity: (data.recommendations ?? []).slice(0, 5).map((rec: any) => ({
      id: rec.id,
      problem_title: rec.title ?? "",
      topic_name: rec.topic ?? null,
      difficulty: rec.difficulty,
      solved_at: rec.created_at ?? new Date().toISOString(),
    })),
  };
}

export async function getProgress(): Promise<ProgressSnapshot> {
  if (isPreviewMode) return delay().then(preview.previewProgress);
  const data = await apiRequest<any>(withTimezone("/api/progress"));
  return {
    totals: {
      total: Number(data.totals?.easy ?? 0) + Number(data.totals?.medium ?? 0) + Number(data.totals?.hard ?? 0),
      baseline: Number(data.baseline?.easy ?? 0) + Number(data.baseline?.medium ?? 0) + Number(data.baseline?.hard ?? 0),
      path_pointer: Number(data.path_pointer?.easy ?? 0) + Number(data.path_pointer?.medium ?? 0) + Number(data.path_pointer?.hard ?? 0),
      easy: Number(data.totals?.easy ?? 0),
      medium: Number(data.totals?.medium ?? 0),
      hard: Number(data.totals?.hard ?? 0),
    },
    baseline: {
      easy: Number(data.baseline?.easy ?? 0),
      medium: Number(data.baseline?.medium ?? 0),
      hard: Number(data.baseline?.hard ?? 0),
    },
    path_pointer: {
      easy: Number(data.path_pointer?.easy ?? 0),
      medium: Number(data.path_pointer?.medium ?? 0),
      hard: Number(data.path_pointer?.hard ?? 0),
    },
    solved_this_week: Number(data.solved_this_week ?? 0),
    solved_this_month: Number(data.solved_this_month ?? 0),
    current_streak: Number(data.current_streak ?? 0),
    longest_streak: Number(data.longest_streak ?? 0),
    daily_activity: (data.daily_activity ?? []).map((d: any) => ({
      date: d.date,
      count: Number(d.count ?? 0),
    })),
    monthly_activity: (data.monthly_activity ?? []).map((m: any) => ({
      month: m.month,
      count: Number(m.count ?? 0),
    })),
  };
}

export async function getMastery(): Promise<TopicMastery[]> {
  if (isPreviewMode) return delay().then(() => preview.previewMastery);
  const data = await apiRequest<{ mastery?: any[] }>("/api/mastery");
  return (data?.mastery ?? []).map(toFrontendMastery);
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  if (isPreviewMode) return delay().then(preview.previewAnalytics);
  const [masteryData, dashboardData, progressData] = await Promise.all([
    apiRequest<{ mastery?: any[] }>("/api/mastery"),
    apiRequest<any>(withTimezone("/api/dashboard")),
    apiRequest<any>(withTimezone("/api/progress")),
  ]);
  const mastery = (masteryData?.mastery ?? dashboardData?.mastery ?? []).map(toFrontendMastery);
  const weak_topics = (dashboardData?.weak_topics ?? [...mastery].sort((a, b) => a.mastery_score - b.mastery_score)).map((row: any) => toFrontendMastery(row));
  
  // Difficulty distribution: compute from progress totals or use dashboard fallback
  const totals = progressData?.totals ?? dashboardData?.solved_stats?.total ?? {};
  const difficulty_distribution = [
    { difficulty: "Easy" as const, count: Number(totals.easy ?? 0) },
    { difficulty: "Medium" as const, count: Number(totals.medium ?? 0) },
    { difficulty: "Hard" as const, count: Number(totals.hard ?? 0) },
  ];
  
  // Weekly activity from progress (most up-to-date)
  const weeklyRows = (progressData?.daily_activity ?? []).slice(-7);
  
  return {
    mastery,
    weak_topics,
    difficulty_distribution,
    weekly_activity: weeklyRows.map((day: any) => ({
      date: day.date,
      count: Number(day.count ?? 0),
      goal: Number(day.goal ?? 0),
    })),
    monthly_activity: (progressData?.monthly_activity ?? []).map((row: any) => ({
      month: row.month,
      count: Number(row.count ?? 0),
    })),
  };
}

/* ---------------------------- problems & solving --------------------------- */

export interface ProblemFilters {
  search?: string;
  topic_id?: string;
  subtopic_id?: string;
  difficulty?: string;
  status?: "solved" | "unsolved" | "";
  page?: number;
  page_size?: number;
}

export async function getProblems(filters: ProblemFilters = {}): Promise<Paginated<Problem>> {
  if (isPreviewMode) return delay().then(() => preview.previewProblemsPage(filters));
  const query = {
    search: filters.search,
    topic: filters.topic_id,
    subtopic: filters.subtopic_id,
    difficulty: filters.difficulty,
    status: filters.status || undefined,
    page: filters.page ?? 1,
    limit: filters.page_size ?? 20,
    sort: "displayOrder",
    order: "asc",
  };

  const data = await apiRequest<any>("/api/problems", { query });
  const items = (data?.problems ?? []).map(toFrontendProblem);
  return {
    items,
    page: Number(data?.pagination?.page ?? 1),
    page_size: Number(data?.pagination?.limit ?? items.length),
    total: Number(data?.pagination?.total ?? items.length),
  };
}

export async function solveProblem(problemId: string): Promise<{ ok: true }> {
  if (isPreviewMode) {
    await delay(650);
    const p = preview.previewProblems.find((x) => x.id === problemId);
    if (p) p.is_solved = true;
    return { ok: true };
  }
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return apiRequest<{ ok: true }>(`/api/problems/${encodeURIComponent(problemId)}/solve`, {
    method: "POST",
    body: { timezone },
  });
}

export async function getRecommendations(): Promise<Recommendation[]> {
  if (isPreviewMode) return delay().then(preview.previewRecommendations);
  const data = await apiRequest<{ recommendations?: any[] }>("/api/recommendations");
  return (data?.recommendations ?? []).map((rec: any) => ({
    id: rec.id,
    problem: toFrontendProblem({
      id: rec.problem_id,
      title: rec.title,
      url: rec.url,
      difficulty: rec.difficulty,
      topic_id: rec.topic_id,
      topic_name: rec.topic_name,
      subtopic_name: rec.subtopic_name,
      is_solved: false,
    }),
    reason: rec.reason,
    priority: rec.score && rec.score > 80 ? "high" : rec.score > 45 ? "medium" : "low",
    status: rec.status ?? "pending",
  }));
}

export async function getTop150(): Promise<Top150Response> {
  if (isPreviewMode) return delay().then(preview.previewTop150);
  const data = await apiRequest<any>("/api/top-150");
  const problems = (data?.problems ?? []).map(toFrontendProblem);
  const groups = (data?.by_topic ?? []).map((group: any) => ({
    topic_id: group.topic_id,
    topic_name: group.topic_name,
    solved: Number(group.solved ?? 0),
    total: Number(group.total ?? 0),
    problems: problems.filter((p: Problem) => p.topic_id === group.topic_id),
  }));
  return {
    overall: {
      solved: Number(data?.solved ?? 0),
      total: Number(data?.total ?? 0),
    },
    topics: groups,
  };
}

/* --------------------------------- roadmap -------------------------------- */

export async function getRoadmap(): Promise<RoadmapResponse> {
  if (isPreviewMode) return delay().then(preview.previewRoadmap);
  const data = await apiRequest<any>("/api/roadmap");
  const stages = (data?.stages ?? []).map((stage: any, index: number) => ({
    stage: Number(stage.stage ?? index + 1),
    title: stage.title,
    description: stage.description,
    progress: Number(stage.progress ?? 0),
    topics: (stage.topics ?? []).map((topic: any) => ({
      id: topic.id,
      name: topic.name,
      progress: Number(topic.progress ?? 0),
      status: topic.status,
      solved: Number(topic.solved ?? 0),
      total: Number(topic.total ?? 0),
      subtopics: (topic.subtopics ?? []).map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        status: sub.status,
      })),
    })),
  }));
  const currentStageIndex = data?.stages?.findIndex((s: any) => s.progress < 100) ?? -1;
  const currentStage = currentStageIndex >= 0 ? currentStageIndex + 1 : data?.stages?.length ?? 1;

  return {
    overall_progress: Number(data?.overall_progress ?? 0),
    current_stage: currentStage,
    stages,
  };
}

export async function updateRoadmapProgress(input: {
  roadmap_topic_id: string;
  roadmap_subtopic_id?: string;
  status: "completed" | "in_progress" | "not_started";
}) {
  if (isPreviewMode) return delay(450).then(() => ({ ok: true as const }));
  const body = {
    roadmapSubtopicId: input.roadmap_subtopic_id ?? input.roadmap_topic_id,
    status: input.status,
  };
  return apiRequest<{ ok: true }>("/api/roadmap", { method: "PATCH", body });
}

/* ------------------------------ notifications ----------------------------- */

export async function getNotifications(): Promise<AppNotification[]> {
  if (isPreviewMode) return delay().then(() => preview.previewNotifications);
  const data = await apiRequest<{ notifications?: any[] }>("/api/notifications");
  return (data?.notifications ?? []).map(toFrontendNotification);
}

export async function markNotificationRead(id: string) {
  if (isPreviewMode) {
    await delay(200);
    const n = preview.previewNotifications.find((x) => x.id === id);
    if (n) n.read = true;
    return { ok: true as const };
  }
  return apiRequest<{ ok: true }>(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead() {
  if (isPreviewMode) {
    await delay(280);
    preview.previewNotifications.forEach((n) => (n.read = true));
    return { ok: true as const };
  }
  return apiRequest<{ ok: true }>("/api/notifications/read-all", { method: "PATCH" });
}

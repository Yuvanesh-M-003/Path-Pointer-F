/**
 * Frontend contract types used by the UI.
 * The adapter layer maps backend responses to these shapes so the UI remains stable.
 */

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  leetcode_username: string | null;
  onboarding_completed: boolean;
  created_at?: string;
}

export interface Topic {
  id: string;
  name: string;
  slug?: string;
  order_index?: number;
  subtopics?: Subtopic[];
}

export interface Subtopic {
  id: string;
  topic_id: string;
  name: string;
}

export interface SolvedTotals {
  total: number;
  baseline: number;
  path_pointer: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface DailyPoint {
  date: string;
  count: number;
  goal?: number;
}

export interface DashboardSummary {
  profile?: Pick<Profile, "full_name" | "avatar_url" | "leetcode_username">;
  totals: SolvedTotals;
  solved_today: number;
  daily_goal: number;
  remaining_today: number;
  current_streak: number;
  longest_streak: number;
  weekly: { solved: number; goal: number; days: DailyPoint[] };
  recent_activity: Array<{
    id: string;
    problem_title: string;
    topic_name: string | null;
    difficulty: Difficulty;
    solved_at: string;
  }>;
}

export interface TopicMastery {
  topic_id: string;
  topic_name: string;
  solved_count: number;
  coverage_score: number;
  difficulty_score: number;
  consistency_score: number;
  self_assessment_score: number;
  mastery_score: number;
  is_weak: boolean;
}

export interface ProgressSnapshot {
  totals: SolvedTotals;
  baseline: { easy: number; medium: number; hard: number };
  path_pointer: { easy: number; medium: number; hard: number };
  solved_this_week: number;
  solved_this_month: number;
  current_streak: number;
  longest_streak: number;
  daily_activity: DailyPoint[];
  monthly_activity: Array<{ month: string; count: number }>;
}

export interface Problem {
  id: string;
  title: string;
  url: string;
  difficulty: Difficulty;
  topic_id: string | null;
  topic_name: string | null;
  subtopic_name: string | null;
  is_solved: boolean;
  solved_at?: string | null;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}

export interface Recommendation {
  id: string;
  problem: Problem;
  reason: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed" | "skipped";
}

export interface Top150TopicGroup {
  topic_id: string;
  topic_name: string;
  solved: number;
  total: number;
  problems: Problem[];
}

export interface Top150Response {
  overall: { solved: number; total: number };
  topics: Top150TopicGroup[];
}

export interface RoadmapSubtopic {
  id: string;
  name: string;
  status: "completed" | "in_progress" | "not_started";
}

export interface RoadmapTopic {
  id: string;
  name: string;
  progress: number;
  status: "completed" | "in_progress" | "not_started";
  solved: number;
  total: number;
  subtopics: RoadmapSubtopic[];
}

export interface RoadmapStage {
  stage: number;
  title: string;
  description?: string;
  progress: number;
  topics: RoadmapTopic[];
}

export interface RoadmapResponse {
  overall_progress: number;
  current_stage: number;
  stages: RoadmapStage[];
}

export type NotificationType =
  | "daily_goal_completed"
  | "new_recommendation"
  | "weak_topic_detected"
  | "streak_milestone"
  | "top_150_milestone"
  | "roadmap_milestone";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface OnboardingPayload {
  name: string;
  leetcodeUsername: string | null;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  topicRatings: Array<{ topicId: string; rating: number }>;
}

export interface AnalyticsResponse {
  mastery: TopicMastery[];
  weak_topics: TopicMastery[];
  difficulty_distribution: Array<{ difficulty: Difficulty; count: number }>;
  weekly_activity: DailyPoint[];
  monthly_activity: Array<{ month: string; count: number }>;
}

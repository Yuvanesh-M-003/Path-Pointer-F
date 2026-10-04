/**
 * ⚠️ ISOLATED PREVIEW FIXTURES — NOT PRODUCTION DATA.
 *
 * These are used *only* when `VITE_API_BASE_URL` is not configured, so the UI
 * can be reviewed before the backend is wired up. The moment the env var is
 * set, `src/lib/api/endpoints.ts` sends every request to the real backend and
 * none of this file is executed. A persistent banner is shown while active.
 */
import type {
  AnalyticsResponse,
  AppNotification,
  DailyPoint,
  DashboardSummary,
  Paginated,
  Problem,
  Profile,
  ProgressSnapshot,
  Recommendation,
  RoadmapResponse,
  Top150Response,
  Topic,
  TopicMastery,
  Difficulty,
} from "./types";

const TOPIC_NAMES = [
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Queue",
  "Hashing",
  "Two Pointer",
  "Sliding Window",
  "Binary Search",
  "Trees",
  "Binary Search Tree",
  "Heap / Priority Queue",
  "Graphs",
  "Greedy",
  "Dynamic Programming",
  "Backtracking",
  "Bit Manipulation",
  "Trie",
  "Segment Tree",
  "Math / Number Theory",
];

const SUBTOPICS: Record<string, string[]> = {
  Arrays: ["Basics", "Prefix Sum", "Sliding Window", "Kadane's Algorithm", "Matrix"],
  Strings: ["Basics", "Palindromes", "Pattern Matching", "Parsing"],
  "Linked List": ["Traversal", "Reversal", "Cycle Detection", "Merging"],
  Stack: ["Monotonic Stack", "Expression Parsing", "Min Stack"],
  Queue: ["Deque", "Monotonic Queue", "BFS Queue"],
  Hashing: ["Hash Map", "Hash Set", "Frequency Counting"],
  Trees: ["Traversals", "Depth / Height", "LCA", "Views"],
  Graphs: ["BFS", "DFS", "Topological Sort", "Shortest Path", "Union Find"],
  "Dynamic Programming": ["1D DP", "2D DP", "Knapsack", "LIS", "DP on Trees"],
};

const seededRandom = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

const mastery0 = [78, 71, 62, 58, 54, 74, 66, 49, 61, 55, 47, 42, 43, 52, 31, 36, 57, 28, 22, 46];

export const previewTopics: Topic[] = TOPIC_NAMES.map((name, i) => ({
  id: `topic-${i + 1}`,
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  order_index: i,
  subtopics: (SUBTOPICS[name] ?? ["Basics", "Intermediate", "Advanced"]).map((s, j) => ({
    id: `sub-${i + 1}-${j + 1}`,
    topic_id: `topic-${i + 1}`,
    name: s,
  })),
}));

export const previewMastery: TopicMastery[] = previewTopics.map((t, i) => {
  const score = mastery0[i] ?? 40;
  return {
    topic_id: t.id,
    topic_name: t.name,
    solved_count: Math.round(score / 6) + 2,
    coverage_score: Math.min(100, score + 6),
    difficulty_score: Math.max(10, score - 9),
    consistency_score: Math.max(15, score - 4),
    self_assessment_score: Math.round(score / 10),
    mastery_score: score,
    is_weak: score < 45,
  };
});

const PROBLEM_TITLES = [
  ["Two Sum", "Easy"],
  ["Best Time to Buy and Sell Stock", "Easy"],
  ["Product of Array Except Self", "Medium"],
  ["Maximum Subarray", "Medium"],
  ["Longest Substring Without Repeating Characters", "Medium"],
  ["Group Anagrams", "Medium"],
  ["Valid Parentheses", "Easy"],
  ["Merge Intervals", "Medium"],
  ["Course Schedule", "Medium"],
  ["Number of Islands", "Medium"],
  ["Clone Graph", "Medium"],
  ["Word Ladder", "Hard"],
  ["Coin Change", "Medium"],
  ["Longest Increasing Subsequence", "Medium"],
  ["Edit Distance", "Hard"],
  ["House Robber", "Medium"],
  ["Binary Tree Level Order Traversal", "Medium"],
  ["Validate Binary Search Tree", "Medium"],
  ["Lowest Common Ancestor of a BST", "Easy"],
  ["Kth Largest Element in an Array", "Medium"],
  ["Merge k Sorted Lists", "Hard"],
  ["Reverse Linked List", "Easy"],
  ["Linked List Cycle", "Easy"],
  ["Implement Trie (Prefix Tree)", "Medium"],
  ["Word Search II", "Hard"],
  ["Range Sum Query - Mutable", "Hard"],
  ["Single Number", "Easy"],
  ["Counting Bits", "Easy"],
  ["Container With Most Water", "Medium"],
  ["Trapping Rain Water", "Hard"],
] as const;

export const previewProblems: Problem[] = PROBLEM_TITLES.map(([title, difficulty], i) => {
  const topic = previewTopics[i % previewTopics.length];
  const subs = topic.subtopics ?? [];
  return {
    id: `prob-${i + 1}`,
    title,
    url: `https://leetcode.com/problems/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/`,
    difficulty: difficulty as Difficulty,
    topic_id: topic.id,
    topic_name: topic.name,
    subtopic_name: subs[i % Math.max(subs.length, 1)]?.name ?? null,
    is_solved: i % 4 === 0,
  };
});

const rnd = seededRandom(20260210);
const dailyActivity: DailyPoint[] = Array.from({ length: 364 }).map((_, idx) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (363 - idx));
  const weekday = d.getDay();
  const r = rnd();
  const base = weekday === 0 || weekday === 6 ? 0.45 : 0.8;
  const count = r < 1 - base ? 0 : Math.max(0, Math.round(r * 6) - 1);
  return { date: d.toISOString().slice(0, 10), count, goal: 4 };
});

const totals = {
  total: 168,
  baseline: 132,
  path_pointer: 36,
  easy: 74,
  medium: 71,
  hard: 23,
};

export const previewProfile: Profile = {
  id: "preview-user",
  email: "you@pathpointer.dev",
  full_name: "Preview User",
  avatar_url: null,
  leetcode_username: "preview_user",
  onboarding_completed: true,
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 96).toISOString(),
};

export function previewDashboard(): DashboardSummary {
  const last7 = dailyActivity.slice(-7);
  return {
    profile: {
      full_name: previewProfile.full_name,
      avatar_url: null,
      leetcode_username: previewProfile.leetcode_username,
    },
    totals,
    solved_today: last7[6]?.count ?? 2,
    daily_goal: 4,
    remaining_today: Math.max(0, 4 - (last7[6]?.count ?? 2)),
    current_streak: 12,
    longest_streak: 27,
    weekly: { solved: last7.reduce((a, b) => a + b.count, 0), goal: 28, days: last7 },
    recent_activity: previewProblems.slice(0, 5).map((p, i) => ({
      id: p.id,
      problem_title: p.title,
      topic_name: p.topic_name,
      difficulty: p.difficulty,
      solved_at: new Date(Date.now() - i * 1000 * 60 * 137).toISOString(),
    })),
  };
}

export function previewProgress(): ProgressSnapshot {
  const monthNames = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  return {
    totals,
    baseline: { easy: 58, medium: 56, hard: 18 },
    path_pointer: { easy: 16, medium: 15, hard: 5 },
    solved_this_week: dailyActivity.slice(-7).reduce((a, b) => a + b.count, 0),
    solved_this_month: dailyActivity.slice(-30).reduce((a, b) => a + b.count, 0),
    current_streak: 12,
    longest_streak: 27,
    daily_activity: dailyActivity,
    monthly_activity: monthNames.map((month, i) => ({ month, count: 14 + i * 5 + (i % 2 ? 4 : -3) })),
  };
}

export function previewAnalytics(): AnalyticsResponse {
  return {
    mastery: previewMastery,
    weak_topics: previewMastery.filter((m) => m.is_weak).sort((a, b) => a.mastery_score - b.mastery_score),
    difficulty_distribution: [
      { difficulty: "Easy", count: totals.easy },
      { difficulty: "Medium", count: totals.medium },
      { difficulty: "Hard", count: totals.hard },
    ],
    weekly_activity: dailyActivity.slice(-7),
    monthly_activity: previewProgress().monthly_activity,
  };
}

export function previewRecommendations(): Recommendation[] {
  const reasons = [
    "Recommended because your Dynamic Programming mastery is low (31%).",
    "Strengthens Graphs — your second weakest topic this week.",
    "Next step after the Prefix Sum subtopic you completed.",
    "Keeps your Trie coverage moving; you have solved only 2 of 9.",
    "Balances your difficulty mix — you have solved few Hard problems recently.",
  ];
  return previewProblems
    .filter((p) => !p.is_solved)
    .slice(0, 5)
    .map((problem, i) => ({
      id: `rec-${i + 1}`,
      problem,
      reason: reasons[i % reasons.length],
      priority: (i === 0 ? "high" : i < 3 ? "medium" : "low") as Recommendation["priority"],
      status: "pending" as const,
    }));
}

export function previewProblemsPage(params: {
  page?: number;
  search?: string;
  topic_id?: string;
  difficulty?: string;
  status?: string;
}): Paginated<Problem> {
  let items = [...previewProblems];
  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter((p) => p.title.toLowerCase().includes(q));
  }
  if (params.topic_id) items = items.filter((p) => p.topic_id === params.topic_id);
  if (params.difficulty) items = items.filter((p) => p.difficulty === params.difficulty);
  if (params.status === "solved") items = items.filter((p) => p.is_solved);
  if (params.status === "unsolved") items = items.filter((p) => !p.is_solved);
  return { items, page: params.page ?? 1, page_size: items.length, total: items.length };
}

export function previewTop150(): Top150Response {
  const groups = previewTopics.slice(0, 8).map((t, i) => {
    const total = [18, 16, 14, 12, 22, 20, 26, 22][i] ?? 15;
    const solved = Math.round(total * ((mastery0[i] ?? 40) / 130));
    return {
      topic_id: t.id,
      topic_name: t.name,
      solved,
      total,
      problems: previewProblems.slice(0, 6).map((p, j) => ({
        ...p,
        id: `t150-${i}-${j}`,
        topic_id: t.id,
        topic_name: t.name,
        is_solved: j < Math.min(solved, 6),
      })),
    };
  });
  return {
    overall: {
      solved: groups.reduce((a, b) => a + b.solved, 0),
      total: 150,
    },
    topics: groups,
  };
}

export function previewRoadmap(): RoadmapResponse {
  const stageDefs: Array<[number, string, string[]]> = [
    [1, "Foundations", ["Arrays", "Strings"]],
    [2, "Linear Structures", ["Linked List", "Stack", "Queue"]],
    [3, "Hierarchical Structures", ["Trees", "Binary Search Tree", "Heap / Priority Queue"]],
    [4, "Graphs", ["Graphs"]],
    [5, "Optimisation", ["Dynamic Programming"]],
  ];
  const stages = stageDefs.map(([stage, title, names]) => {
    const topics = names.map((name) => {
      const m = previewMastery.find((x) => x.topic_name === name)!;
      const subs = SUBTOPICS[name] ?? ["Basics", "Intermediate", "Advanced"];
      const doneCount = Math.round((m.mastery_score / 100) * subs.length);
      return {
        id: m.topic_id,
        name,
        progress: m.mastery_score,
        status: (m.mastery_score > 75 ? "completed" : m.mastery_score > 25 ? "in_progress" : "not_started") as
          | "completed"
          | "in_progress"
          | "not_started",
        solved: m.solved_count,
        total: subs.length * 4,
        subtopics: subs.map((s, j) => ({
          id: `rsub-${m.topic_id}-${j}`,
          name: s,
          status: (j < doneCount ? "completed" : j === doneCount ? "in_progress" : "not_started") as
            | "completed"
            | "in_progress"
            | "not_started",
        })),
      };
    });
    return {
      stage,
      title,
      description: undefined,
      progress: Math.round(topics.reduce((a, b) => a + b.progress, 0) / topics.length),
      topics,
    };
  });
  return { overall_progress: 54, current_stage: 3, stages };
}

export const previewNotifications: AppNotification[] = [
  {
    id: "n1",
    type: "weak_topic_detected",
    title: "Weak topic detected",
    body: "Dynamic Programming dropped to 31% mastery. We added 3 new problems to your recommendations.",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: "n2",
    type: "streak_milestone",
    title: "12 day streak",
    body: "You have solved at least one problem for 12 consecutive days. Longest streak: 27.",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "n3",
    type: "daily_goal_completed",
    title: "Daily goal completed",
    body: "You hit your goal of 4 problems yesterday.",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
  },
  {
    id: "n4",
    type: "top_150_milestone",
    title: "Top 150 milestone",
    body: "You crossed 50 problems in the Top 150 module.",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
  },
];

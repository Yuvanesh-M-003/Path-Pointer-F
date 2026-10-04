# API Verification Checklist

**Purpose:** Cross-check backend API responses at `http://localhost:3000` against frontend types to ensure all fields use **snake_case** consistently.

**Status:** ✅ Normalization layer implemented in `src/lib/api/client.ts`

---

## Implementation Summary

### What Was Done

1. **Added `normalizeKeysToSnakeCase()` in `src/lib/api/client.ts`**
   - Recursively converts all camelCase keys to snake_case
   - Handles nested objects, arrays, and primitives
   - Runs on every API response before returning to callers
   - Transformation: `avatarUrl` → `avatar_url`, `leetcodeUsername` → `leetcode_username`, etc.

2. **Updated `apiRequest()` function**
   - Calls `normalizeKeysToSnakeCase()` on all responses
   - Works with both bare payloads and `{ data: ... }` envelopes
   - Ensures 100% of frontend code receives snake_case keys

3. **Simplified adapter functions in `src/lib/api/endpoints.ts`**
   - Removed defensive fallbacks (`field1 ?? field2`)
   - Updated functions:
     - `toFrontendProfile()` - expects strict snake_case
     - `toFrontendTopic()` - simplified field access
     - `toFrontendMastery()` - removed camelCase handling
     - `toFrontendProblem()` - simplified field access
     - `toFrontendNotification()` - simplified field access

4. **Updated request bodies to use snake_case**
   - `updateProfile()` - now sends `full_name` and `leetcode_username`
   - `submitOnboarding()` - now sends `full_name`, `leetcode_username`, `easy_solved`, `medium_solved`, `hard_solved`, `topic_ratings[].topic_id`

---

## Frontend Type Definitions

All these types in `src/lib/api/types.ts` now expect **strict snake_case**:

### Profile
```
id, email, full_name, avatar_url, leetcode_username, onboarding_completed, created_at
```

### DashboardSummary
```
profile { full_name, avatar_url, leetcode_username }
totals { total, baseline, path_pointer, easy, medium, hard }
solved_today, daily_goal, remaining_today
current_streak, longest_streak
weekly { solved, goal, days[] { date, count, goal } }
recent_activity[] { id, problem_title, topic_name, difficulty, solved_at }
```

### ProgressSnapshot
```
totals { total, baseline, path_pointer, easy, medium, hard }
baseline { easy, medium, hard }
path_pointer { easy, medium, hard }
solved_this_week, solved_this_month
current_streak, longest_streak
daily_activity[] { date, count, goal }
monthly_activity[] { month, count }
```

### TopicMastery
```
topic_id, topic_name, solved_count
coverage_score, difficulty_score, consistency_score, self_assessment_score, mastery_score
is_weak
```

### Problem
```
id, title, url, difficulty
topic_id, topic_name, subtopic_name
is_solved, solved_at
```

### AnalyticsResponse
```
mastery[] (TopicMastery)
weak_topics[] (TopicMastery)
difficulty_distribution[] { difficulty, count }
weekly_activity[] { date, count, goal }
monthly_activity[] { month, count }
```

### GoalsResponse
```
today { goal, solved, remaining, percentage }
weekly { goal, solved, percentage }
history[] { date, goal, solved, achieved }
```

### RoadmapResponse
```
overall_progress
current_stage
stages[] {
  stage, title, description, progress
  topics[] {
    id, name, progress, status, solved, total
    subtopics[] { id, name, status }
  }
}
```

### AppNotification
```
id, type, title, body
read, created_at
```

---

## Backend API Response Requirements

Your backend at `http://localhost:3000` must return responses with **all keys in snake_case**. 

### Verification Steps

**Before proceeding, ensure your backend is running:**
```bash
# Backend server should be listening at http://localhost:3000
# Check with: curl http://localhost:3000/api/profile (with valid auth token)
```

**Check each endpoint:**

1. **GET /api/profile** → Profile
   - Expected: `{ id, email, full_name, avatar_url, leetcode_username, onboarding_completed, created_at }`
   - ❌ NOT: `{ id, email, name, avatarUrl, leetcodeUsername, onboardingCompleted, createdAt }`

2. **GET /api/topics** → `{ topics: Topic[] }`
   - Expected: `{ topics: [{ id, name, slug, order_index, subtopics: [{ id, topic_id, name }] }] }`
   - ❌ NOT: `{ topics: [{ id, name, slug, displayOrder, subtopics: [{ id, topicId, name }] }] }`

3. **POST /api/onboarding** → `{ profile: Profile }`
   - Receives: `{ full_name, leetcode_username, easy_solved, medium_solved, hard_solved, topic_ratings: [{ topic_id, rating }] }`
   - Returns: Profile (in snake_case)

4. **GET /api/dashboard** → DashboardSummary
   - Expected all keys in snake_case as per DashboardSummary type
   - ❌ NOT: camelCase like `solvedStats`, `dailyGoal`, `longestStreak`

5. **GET /api/progress** → ProgressSnapshot
   - Expected all keys in snake_case as per ProgressSnapshot type
   - ❌ NOT: camelCase versions

6. **GET /api/mastery** → `{ mastery: TopicMastery[] }`
   - Expected: `{ mastery: [{ topic_id, topic_name, solved_count, coverage_score, difficulty_score, consistency_score, self_assessment_score, mastery_score, is_weak }] }`
   - ❌ NOT: `{ mastery: [{ topicId, topic, solvedCount, coverageScore, ... }] }`

7. **GET /api/analytics** → AnalyticsResponse
   - Expected: All keys in snake_case as per AnalyticsResponse type

8. **GET /api/problems?...** → `{ items, page, page_size, total }`
   - Expected: All Problem objects with snake_case keys

9. **GET /api/recommendations** → `Recommendation[]`
   - Each has: `{ id, problem (snake_case), reason, priority, status }`

10. **GET /api/top-150** → Top150Response
    - Expected: `{ overall: { solved, total }, topics: [{ topic_id, topic_name, solved, total, problems[] }] }`

11. **GET /api/roadmap** → RoadmapResponse
    - Expected all nested keys in snake_case

12. **GET /api/goals** → GoalsResponse
    - Expected: `{ today: { goal, solved, remaining, percentage }, weekly: { goal, solved, percentage }, history[] }`

13. **GET /api/notifications** → `AppNotification[]`
    - Expected: Each with `{ id, type, title, body, read, created_at }`

---

## If Backend Returns camelCase

✅ **NO ACTION NEEDED** — The normalization layer in `src/lib/api/client.ts` automatically handles this.

**How it works:**
```
Backend Response (camelCase)
        ↓
apiRequest() receives payload
        ↓
normalizeKeysToSnakeCase() converts all keys
        ↓
Frontend receives snake_case
        ↓
Adapters and types work as expected
```

**Example:**
- Backend sends: `{ avatarUrl: "...", leetcodeUsername: "...", createdAt: "..." }`
- Frontend receives: `{ avatar_url: "...", leetcode_username: "...", created_at: "..." }`

---

## Testing Checklist

After starting the backend, run these tests:

```bash
# 1. Verify backend is running
curl http://localhost:3000/api/profile -H "Authorization: Bearer <token>"

# 2. Start frontend (if not running)
npm run dev
# Should connect to http://localhost:5173

# 3. Open browser DevTools → Application → Network
# 4. Perform these actions and inspect responses:

- [ ] Sign in via Google OAuth → Check /api/profile response
- [ ] Complete onboarding → Check POST /api/onboarding response
- [ ] Navigate to Dashboard → Check /api/dashboard response
- [ ] View Progress page → Check /api/progress response
- [ ] View Analytics page → Check /api/analytics response
- [ ] View Problems → Check /api/problems response
- [ ] Solve a problem → Check PUT /api/problems/:id/solve
- [ ] View Goals → Check /api/goals response
- [ ] View Roadmap → Check /api/roadmap response
- [ ] View Top 150 → Check /api/top-150 response
- [ ] Check notifications → Check /api/notifications response
```

**Expected Result:** All responses should have **snake_case keys only**. If any camelCase is spotted:
1. Check if `normalizeKeysToSnakeCase()` is in `src/lib/api/client.ts` ✅
2. Check if `apiRequest()` calls it on all responses ✅
3. If both are in place, the camelCase will be converted automatically

---

## Code Changes Reference

### src/lib/api/client.ts
- Added `normalizeKeysToSnakeCase()` function
- Updated `apiRequest()` to use normalization before returning

### src/lib/api/endpoints.ts
- Simplified `toFrontendProfile()` - removed camelCase fallbacks
- Simplified `toFrontendTopic()` - removed camelCase fallbacks
- Simplified `toFrontendMastery()` - removed camelCase fallbacks
- Simplified `toFrontendProblem()` - removed camelCase fallbacks
- Simplified `toFrontendNotification()` - removed camelCase fallbacks
- Updated `updateProfile()` to send snake_case request body
- Updated `submitOnboarding()` to send snake_case request body

---

## Next Steps

1. **Start backend server** at `http://localhost:3000`
2. **Start frontend** with `npm run dev`
3. **Test each endpoint** using the Network tab in DevTools
4. **Verify all responses use snake_case** — normalization layer will convert any camelCase automatically
5. **If camelCase is found:**
   - Note which fields and endpoints
   - Backend team should update those endpoints to return snake_case
   - Frontend will automatically normalize any stragglers

---

## Important Notes

- ✅ **Normalization is automatic** — No frontend code changes needed if backend sends camelCase
- ✅ **Request bodies are snake_case** — Frontend consistently sends snake_case to backend
- ✅ **Adapter functions simplified** — No more defensive fallbacks needed
- ✅ **Single source of truth** — All keys normalized at the API boundary
- ✅ **Safe for camelCase responses** — If backend returns camelCase, it's automatically converted

---

**Last Updated:** 2025-08-18

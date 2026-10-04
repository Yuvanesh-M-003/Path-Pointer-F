# Path Pointer — Frontend

**Coding Practice.** A DSA learning and progress platform: baseline + in-app solved tracking, topic mastery,
weak-topic detection, personalized recommendations, daily goals, roadmap, Top 150 module, analytics and
in-app notifications.

This repository contains **only the frontend**. All business logic (mastery, recommendations, daily goals,
streaks, duplicate prevention) stays in your existing backend + Supabase/Postgres database. The frontend never
touches Postgres directly and never imports server-only code.

> **Stack note:** this workspace is a **React 19 + Vite + Tailwind v4 SPA** (not Next.js). The routing tree
> mirrors the requested App Router structure 1:1 (`/`, `/login`, `/auth/callback`, `/onboarding`,
> `/dashboard/*`) using React Router. Public env vars therefore use the `VITE_` prefix; the Next.js
> `NEXT_PUBLIC_*` equivalents are documented in `.env.example` and `src/lib/env.ts`.

---

## 1. File structure

```
public/
  logo.png                        # official Path Pointer logo (also the favicon)
src/
  App.tsx                         # router, providers, error boundary, 404
  main.tsx
  index.css                       # theme tokens (navy / brand blue / accent orange), base + utilities
  lib/
    env.ts                        # env config + isPreviewMode flag
    supabase/client.ts            # browser Supabase client (singleton) + OAuth redirect helper
    auth/
      AuthProvider.tsx            # session bootstrap, Google sign-in, logout, 401 handling
      guards.tsx                  # RequireAuth / RequireOnboarded / RequireIncompleteOnboarding / RedirectIfAuthenticated
    api/
      client.ts                   # fetch wrapper, ApiError, friendlyMessage(), auth header, 401 hook
      endpoints.ts                # every backend call lives here (documented contract)
      queries.ts                  # TanStack Query hooks + cache invalidation after mutations
      types.ts                    # API response types (mirror the existing DB schema)
      preview-fixtures.ts         # ISOLATED preview data, used only when VITE_API_BASE_URL is unset
    utils/format.ts
  components/
    common/                       # Logo, Button, Card, Badge, DifficultyBadge, TopicBadge, Modal,
                                  # Toast, Skeleton set, EmptyState, ErrorState, StatCard, ProgressBar,
                                  # FullPageLoader, GoogleIcon, PreviewBanner
    layout/                       # DashboardLayout (sidebar + navbar + mobile drawer), PageHeader
    navigation/nav-items.ts
    dashboard/WeakTopics.tsx      # WeakTopicsCard + MasteryCard
    problems/                     # ProblemCard, SolveFlow (LeetCode open + confirm modal), RecommendationCard
    analytics/                    # Charts.tsx (radar, donut, weekly bars, monthly area, mastery bars), Heatmap.tsx
  pages/
    Landing.tsx  Login.tsx  AuthCallback.tsx  Onboarding.tsx
    dashboard/  DashboardHome · ProblemsPage · RecommendationsPage · ProgressPage ·
                AnalyticsPage · GoalsPage · RoadmapPage · Top150Page ·
                NotificationsPage · ProfilePage
```

## 2. npm packages

Runtime: `react`, `react-dom`, `react-router-dom`, `@supabase/supabase-js`, `@tanstack/react-query`,
`framer-motion`, `recharts`, `lucide-react`, `clsx`, `tailwind-merge`.
Dev: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `typescript`.

## 3. Environment variables (`.env.local`)

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL (browser client) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anon key |
| `VITE_API_BASE_URL` | Path Pointer backend base URL |
| `VITE_SITE_URL` | Public origin used for the OAuth redirect |

Never expose the service-role key, database URL or any private secret to the browser.

**Preview mode:** if `VITE_API_BASE_URL` is missing, the app renders from `src/lib/api/preview-fixtures.ts`
and shows a persistent orange banner. Setting the variable switches every call to the real backend — no fake
data can leak into production.

## 4. Authentication setup

1. Supabase → Authentication → Providers → **Google**: enable and paste the Google Cloud OAuth client
   ID/secret.
2. Google Cloud console → authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Supabase → URL configuration → Site URL + additional redirect URLs:
   `http://localhost:5173/#/auth/callback` and `https://<your-domain>/#/auth/callback`
   (hash form because the SPA uses `HashRouter`; drop the `#` if you port to Next.js).
4. Flow: Landing → *Continue with Google* → Google → Supabase → `/auth/callback` → `getProfile()` →
   `onboarding_completed ? /dashboard : /onboarding`.
5. Your backend must accept the Supabase JWT as `Authorization: Bearer <access_token>` and derive `user_id`
   from it — the frontend never sends a user id.

## 5. API contract expected by the frontend

All paths are relative to `VITE_API_BASE_URL`; change them in `src/lib/api/endpoints.ts` only.

| Method | Path | Returns |
| --- | --- | --- |
| GET | `/api/profile` | `Profile` |
| PATCH | `/api/profile` | `Profile` (`full_name`, `leetcode_username`) |
| GET | `/api/topics` | `Topic[]` (ids + names + optional subtopics) |
| POST | `/api/onboarding` | `{ profile }` — body `{ leetcode_username, baseline{easy,medium,hard}, topic_ratings[{topic_id,rating}] }` |
| GET | `/api/dashboard` | `DashboardSummary` (totals incl. baseline + in-app, goal, streaks, weekly, recent activity) |
| GET | `/api/progress` | `ProgressSnapshot` (totals, baseline vs in-app, streaks, `daily_activity[]`, monthly) |
| GET | `/api/mastery` | `TopicMastery[]` (coverage/difficulty/consistency/self/mastery + `is_weak`) |
| GET | `/api/analytics` | `AnalyticsResponse` (mastery, weak topics, difficulty split, weekly, monthly) |
| GET | `/api/recommendations` | `Recommendation[]` (`problem`, `reason`, `priority`, `status`) |
| GET | `/api/problems` | `Paginated<Problem>` — query `search,topic_id,difficulty,status,page,page_size` |
| POST | `/api/problems/:id/solve` | `{ ok:true }`, **409** when already solved (`UNIQUE(user_id, problem_id)`) |
| GET | `/api/top-150` | `Top150Response` (overall + topic groups + problems) |
| GET | `/api/roadmap` | `RoadmapResponse` (stages → topics → subtopics + progress) |
| POST | `/api/roadmap/progress` | `{ ok:true }` — body `{ roadmap_topic_id, roadmap_subtopic_id?, status }` |
| GET | `/api/goals` | `GoalsResponse` (today, weekly, history) |
| GET | `/api/notifications` | `AppNotification[]` |
| POST | `/api/notifications/:id/read` | `{ ok:true }` |
| POST | `/api/notifications/read-all` | `{ ok:true }` |

Both bare payloads and `{ data: ... }` envelopes are supported. Statuses 400/401/403/404/409/422/429/5xx and
network failures are mapped to friendly copy in `friendlyMessage()`; 401 clears the session and returns the
user to login.

## 6. Run locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase + backend values
npm run dev                  # http://localhost:5173
npm run build && npm run preview
```

Replace `public/logo.png` with the official uploaded asset if it is not already in place — the component never
recolors, stretches or redraws it.

## 7. Testing checklist

**Auth**
- [ ] Landing → Continue with Google → Supabase → `/auth/callback` completes without loops.
- [ ] Session persists across refresh; logout clears it and returns to the landing page.
- [ ] Direct visit to `/dashboard/*` while signed out redirects to `/login`.
- [ ] `onboarding_completed=false` → forced to `/onboarding`; `true` → `/onboarding` redirects to `/dashboard`.
- [ ] OAuth error (provider disabled) shows an inline, readable error.

**Onboarding**
- [ ] Username validation (empty / bad characters / valid) and submit disabled while invalid.
- [ ] Easy/Medium/Hard accept integers ≥ 0 only; non-numeric input rejected.
- [ ] All topic sliders must be rated before submit; counter shows `n/total`.
- [ ] Loading, success and API-failure + retry states all work.

**API / data**
- [ ] Every page shows skeleton → data, error + retry, and empty state variants.
- [ ] Marking a problem solved refetches dashboard, progress, mastery, goals, recommendations, Top 150.
- [ ] Solving an already-solved problem surfaces the 409 “already marked as solved” message.
- [ ] Total Solved equals baseline + in-app solved (e.g. 100 + 10 = 110).

**Responsive (320 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440+)**
- [ ] No horizontal page overflow at any width.
- [ ] Sidebar is fixed ≥1024px and a drawer below; tapping an item navigates and closes the drawer.
- [ ] Radar labels abbreviate on mobile and never overlap; all charts resize.
- [ ] Heatmap scrolls horizontally on small screens; cards stack; buttons stay ≥36px tall.

**Accessibility**
- [ ] Keyboard-only navigation reaches every control; focus rings visible.
- [ ] Form labels, `aria-invalid`, and error messages are associated with fields.
- [ ] Notification bell, drawer toggle and icon-only buttons expose `aria-label`.

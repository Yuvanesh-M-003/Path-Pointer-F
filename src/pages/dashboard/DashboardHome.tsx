import { Link } from "react-router-dom";
import { Activity, CalendarDays, CheckCircle2, Flame, Target, Timer, TrendingUp } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/common/Card";
import { StatCard, ProgressBar } from "@/components/common/StatCard";
import { DashboardSkeleton, ChartSkeleton, ListSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge, DifficultyBadge } from "@/components/common/Badge";
import { MasteryRadarChart, WeeklyActivityChart } from "@/components/analytics/Charts";
import { ActivityHeatmap } from "@/components/analytics/Heatmap";
import { WeakTopicsCard } from "@/components/dashboard/WeakTopics";
import { RecommendationCard } from "@/components/problems/RecommendationCard";
import { useDashboard, useMastery, useProgress, useRecommendations } from "@/lib/api/queries";
import { formatNumber, percent, relativeTime } from "@/lib/utils/format";

export default function DashboardHome() {
  const dashboard = useDashboard();
  const mastery = useMastery();
  const recs = useRecommendations();
  const progress = useProgress();

  if (dashboard.isLoading) return <DashboardSkeleton />;

  if (dashboard.isError || !dashboard.data) {
    return (
      <ErrorState
        title="We couldn't load your dashboard"
        description="Path Pointer couldn't reach the backend. Your data is safe — try again in a moment."
        onRetry={() => void dashboard.refetch()}
        retrying={dashboard.isFetching}
      />
    );
  }

  const d = dashboard.data;
  const goalPct = percent(d.solved_today, Math.max(d.daily_goal, 1));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Welcome back{d.profile?.full_name ? `, ${d.profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-[13.5px] text-slate-400">
          {d.remaining_today > 0
            ? `${d.remaining_today} more ${d.remaining_today === 1 ? "problem" : "problems"} to hit today's goal.`
            : "Today's goal is complete. Nice work."}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          index={0}
          label="Total Solved"
          value={formatNumber(d.totals.total)}
          hint={`${formatNumber(d.totals.baseline)} baseline + ${formatNumber(d.totals.path_pointer)} in-app`}
          icon={<CheckCircle2 className="size-3.5" aria-hidden />}
        />
        <StatCard
          index={1}
          label="Solved Today"
          value={formatNumber(d.solved_today)}
          hint={`Goal ${d.daily_goal}`}
          icon={<Activity className="size-3.5" aria-hidden />}
          progress={goalPct}
        />
        <StatCard
          index={2}
          label="Daily Goal"
          value={formatNumber(d.daily_goal)}
          hint="Set by Path Pointer"
          icon={<Target className="size-3.5" aria-hidden />}
          tone="accent"
        />
        <StatCard
          index={3}
          label="Remaining Today"
          value={formatNumber(d.remaining_today)}
          hint={d.remaining_today === 0 ? "Goal complete" : "Keep going"}
          icon={<Timer className="size-3.5" aria-hidden />}
        />
        <StatCard
          index={4}
          label="Current Streak"
          value={`${formatNumber(d.current_streak)}d`}
          hint={`Longest ${d.longest_streak}d`}
          icon={<Flame className="size-3.5" aria-hidden />}
          tone="accent"
        />
        <StatCard
          index={5}
          label="Weekly Progress"
          value={`${formatNumber(d.weekly.solved)}/${formatNumber(d.weekly.goal)}`}
          hint="Last 7 days"
          icon={<TrendingUp className="size-3.5" aria-hidden />}
          progress={percent(d.weekly.solved, Math.max(d.weekly.goal, 1))}
        />
      </div>

      {/* charts */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Topic mastery"
            description="Backend-calculated mastery across your strongest topics"
            action={
              <Link to="/dashboard/analytics" className="text-[12px] font-medium text-brand-300 hover:text-brand-200">
                Analytics
              </Link>
            }
          />
          <CardBody className="pt-2">
            {mastery.isLoading ? (
              <ChartSkeleton height={260} />
            ) : mastery.isError ? (
              <ErrorState
                title="Mastery unavailable"
                description="We couldn't load topic mastery."
                onRetry={() => void mastery.refetch()}
              />
            ) : (mastery.data?.length ?? 0) === 0 ? (
              <EmptyState title="No mastery data yet" description="Solve a few problems to unlock topic mastery." />
            ) : (
              <MasteryRadarChart data={mastery.data!} />
            )}
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="This week" description="Problems solved per day" />
            <CardBody className="pt-2">
              <WeeklyActivityChart data={d.weekly.days} height={180} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Daily goal" icon={<Target className="size-4" aria-hidden />} />
            <CardBody>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold tabular-nums text-white">
                  {d.solved_today}
                  <span className="text-base text-slate-500"> / {d.daily_goal}</span>
                </p>
                <Badge tone={goalPct >= 100 ? "success" : "accent"}>{goalPct}%</Badge>
              </div>
              <ProgressBar value={goalPct} tone={goalPct >= 100 ? "success" : "accent"} className="mt-3" />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* weak topics + recommendations */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-1">
          {mastery.isLoading ? (
            <ChartSkeleton height={200} />
          ) : mastery.data ? (
            <WeakTopicsCard mastery={mastery.data} />
          ) : null}
        </div>

        <Card className="xl:col-span-2">
          <CardHeader
            title="Recommended next"
            description="Generated by the Path Pointer engine"
            action={
              <Link
                to="/dashboard/recommendations"
                className="text-[12px] font-medium text-brand-300 hover:text-brand-200"
              >
                See all
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {recs.isLoading ? (
              <ListSkeleton rows={2} />
            ) : recs.isError ? (
              <ErrorState
                title="Recommendations unavailable"
                description="We couldn't load your personalized problems."
                onRetry={() => void recs.refetch()}
              />
            ) : (recs.data?.length ?? 0) === 0 ? (
              <EmptyState
                title="No recommendations yet"
                description="Solve a few problems so the engine can learn your weak areas."
              />
            ) : (
              recs.data!.slice(0, 3).map((rec, i) => <RecommendationCard key={rec.id} rec={rec} index={i} />)
            )}
          </CardBody>
        </Card>
      </div>

      {/* heatmap */}
      <Card>
        <CardHeader
          title="Activity heatmap"
          description="Daily problems solved over the last year"
          icon={<CalendarDays className="size-4" aria-hidden />}
        />
        <CardBody>
          {progress.isLoading ? (
            <ChartSkeleton height={140} />
          ) : progress.isError ? (
            <ErrorState
              title="Activity unavailable"
              description="We couldn't load your daily progress."
              onRetry={() => void progress.refetch()}
            />
          ) : (
            <ActivityHeatmap data={progress.data?.daily_activity ?? []} />
          )}
        </CardBody>
      </Card>

      {/* recent activity */}
      <Card>
        <CardHeader title="Recent activity" description="Problems you marked solved in Path Pointer" />
        <CardBody>
          {d.recent_activity.length === 0 ? (
            <EmptyState
              title="No problems solved yet"
              description="Once you mark a problem as solved it will appear here."
              action={
                <Link to="/dashboard/recommendations">
                  <span className="text-[13px] font-medium text-brand-300 hover:text-brand-200">
                    Get your first recommendation →
                  </span>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {d.recent_activity.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] text-slate-100">{item.problem_title}</p>
                      <p className="text-[11.5px] text-slate-500">{item.topic_name ?? "General"}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <DifficultyBadge difficulty={item.difficulty} />
                    <span className="hidden text-[11.5px] text-slate-500 sm:block">{relativeTime(item.solved_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

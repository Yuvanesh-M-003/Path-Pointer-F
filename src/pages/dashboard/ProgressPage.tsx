import { CalendarDays, CheckCircle2, Flame, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/common/Card";
import { StatCard, ProgressBar } from "@/components/common/StatCard";
import { ChartSkeleton, StatCardSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { DifficultyDonut, MonthlyActivityChart } from "@/components/analytics/Charts";
import { ActivityHeatmap } from "@/components/analytics/Heatmap";
import { useProgress } from "@/lib/api/queries";
import { formatNumber, percent } from "@/lib/utils/format";

export default function ProgressPage() {
  const progress = useProgress();

  if (progress.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  if (progress.isError || !progress.data) {
    return (
      <ErrorState
        title="We couldn't load your progress"
        description="The progress API didn't respond."
        onRetry={() => void progress.refetch()}
        retrying={progress.isFetching}
      />
    );
  }

  const p = progress.data;
  const diffRows = [
    { key: "easy", label: "Easy", tone: "text-emerald-300" },
    { key: "medium", label: "Medium", tone: "text-amber-300" },
    { key: "hard", label: "Hard", tone: "text-rose-300" },
  ] as const;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Progress"
        description="Historical baseline combined with everything you have solved inside Path Pointer."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          index={0}
          label="Total solved"
          value={formatNumber(p.totals.total)}
          hint={`${p.totals.baseline} historical + ${p.totals.path_pointer} in-app`}
          icon={<CheckCircle2 className="size-3.5" aria-hidden />}
        />
        <StatCard index={1} label="This week" value={formatNumber(p.solved_this_week)} icon={<TrendingUp className="size-3.5" aria-hidden />} />
        <StatCard index={2} label="This month" value={formatNumber(p.solved_this_month)} icon={<CalendarDays className="size-3.5" aria-hidden />} />
        <StatCard
          index={3}
          label="Streak"
          value={`${p.current_streak}d`}
          hint={`Longest ${p.longest_streak}d`}
          tone="accent"
          icon={<Flame className="size-3.5" aria-hidden />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Difficulty split" description="All solved problems" />
          <CardBody>
            <DifficultyDonut
              data={[
                { difficulty: "Easy", count: p.totals.easy },
                { difficulty: "Medium", count: p.totals.medium },
                { difficulty: "Hard", count: p.totals.hard },
              ]}
            />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Historical vs Path Pointer" description="Where each solved problem came from" />
          <CardBody className="space-y-4">
            {diffRows.map((row) => {
              const base = p.baseline[row.key];
              const app = p.path_pointer[row.key];
              const total = base + app;
              return (
                <div key={row.key}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className={row.tone}>{row.label}</span>
                    <span className="tabular-nums text-slate-400">
                      {formatNumber(total)} <span className="text-slate-600">({base} + {app})</span>
                    </span>
                  </div>
                  <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full bg-brand-700" style={{ width: `${percent(base, Math.max(total, 1))}%` }} />
                    <div className="h-full bg-cyan-brand" style={{ width: `${percent(app, Math.max(total, 1))}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-4 border-t border-white/[0.06] pt-3 text-[11.5px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-brand-700" /> Historical baseline
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-cyan-brand" /> Solved in Path Pointer
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between text-[12.5px] text-slate-400">
                <span>Path Pointer share of total</span>
                <span className="tabular-nums">{percent(p.totals.path_pointer, Math.max(p.totals.total, 1))}%</span>
              </div>
              <ProgressBar
                value={percent(p.totals.path_pointer, Math.max(p.totals.total, 1))}
                tone="cyan"
                className="mt-2"
                ariaLabel="Share solved inside Path Pointer"
              />
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Daily activity" description="Contribution heatmap from daily progress" />
        <CardBody>
          <ActivityHeatmap data={p.daily_activity} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Monthly trend" description="Problems solved per month" />
        <CardBody>
          <MonthlyActivityChart data={p.monthly_activity} />
        </CardBody>
      </Card>
    </div>
  );
}

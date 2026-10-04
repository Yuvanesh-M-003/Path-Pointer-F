import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/common/Card";
import { ChartSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { MasteryRadarChart, DifficultyDonut, TopicMasteryBars, MonthlyActivityChart, WeeklyActivityChart } from "@/components/analytics/Charts";
import { MasteryCard, WeakTopicsCard } from "@/components/dashboard/WeakTopics";
import { useAnalytics } from "@/lib/api/queries";
import { cn } from "@/utils/cn";

export default function AnalyticsPage() {
  const analytics = useAnalytics();
  const [view, setView] = useState<"radar" | "bars">("radar");

  if (analytics.isLoading) {
    return (
      <div className="space-y-4">
        <ChartSkeleton />
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartSkeleton height={200} />
          <ChartSkeleton height={200} />
        </div>
      </div>
    );
  }

  if (analytics.isError || !analytics.data) {
    return (
      <ErrorState
        title="We couldn't load your analytics"
        description="The analytics API didn't respond."
        onRetry={() => void analytics.refetch()}
        retrying={analytics.isFetching}
      />
    );
  }

  const a = analytics.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        description="Mastery, difficulty distribution and activity trends — all computed by the Path Pointer backend."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Topic mastery"
            description="Coverage, difficulty, consistency and self-assessment combined"
            action={
              <div className="inline-flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5">
                {(["radar", "bars"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[11.5px] font-medium capitalize transition-colors",
                      view === v ? "bg-white/[0.08] text-white" : "text-slate-400 hover:text-slate-200",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            }
          />
          <CardBody className="pt-2">
            {a.mastery.length === 0 ? (
              <EmptyState title="No mastery data yet" description="Mastery appears once you have solved problems." />
            ) : view === "radar" ? (
              <MasteryRadarChart data={a.mastery} height={360} />
            ) : (
              <TopicMasteryBars data={a.mastery} height={Math.max(320, a.mastery.length * 26)} />
            )}
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Difficulty distribution" />
            <CardBody className="pt-1">
              <DifficultyDonut data={a.difficulty_distribution} height={220} />
            </CardBody>
          </Card>
          <WeakTopicsCard mastery={a.weak_topics.length ? a.weak_topics : a.mastery} limit={3} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Weekly activity" description="Last 7 days" />
          <CardBody className="pt-1">
            <WeeklyActivityChart data={a.weekly_activity} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Monthly activity" description="Rolling trend" />
          <CardBody className="pt-1">
            <MonthlyActivityChart data={a.monthly_activity} />
          </CardBody>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-[15px] font-semibold text-white">All topics</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {a.mastery
            .slice()
            .sort((x, y) => y.mastery_score - x.mastery_score)
            .map((t) => (
              <MasteryCard key={t.topic_id} topic={t} />
            ))}
        </div>
      </div>
    </div>
  );
}

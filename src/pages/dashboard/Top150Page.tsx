import { useState } from "react";
import { ChevronDown, Compass } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/common/Card";
import { StatCard, ProgressBar } from "@/components/common/StatCard";
import { Skeleton, StatCardSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { DifficultyBadge } from "@/components/common/Badge";
import { SolveFlow } from "@/components/problems/ProblemCard";
import { useTop150 } from "@/lib/api/queries";
import { percent } from "@/lib/utils/format";
import { cn } from "@/utils/cn";

export default function Top150Page() {
  const top = useTop150();
  const [open, setOpen] = useState<string | null>(null);

  if (top.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (top.isError || !top.data) {
    return (
      <ErrorState
        title="We couldn't load the Top 150"
        description="The Top 150 API didn't respond."
        onRetry={() => void top.refetch()}
        retrying={top.isFetching}
      />
    );
  }

  const t = top.data;
  const pct = percent(t.overall.solved, Math.max(t.overall.total, 1));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Top 150 problems"
        description="A separate curated interview module, tracked topic by topic. Independent from your recommendations queue."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard index={0} label="Solved" value={t.overall.solved} progress={pct} icon={<Compass className="size-3.5" aria-hidden />} />
        <StatCard index={1} label="Remaining" value={Math.max(0, t.overall.total - t.overall.solved)} hint={`of ${t.overall.total}`} />
        <StatCard index={2} label="Completion" value={`${pct}%`} tone="accent" progress={pct} />
      </div>

      {t.topics.length === 0 ? (
        <EmptyState title="No Top 150 data" description="The backend hasn't returned any Top 150 topics yet." />
      ) : (
        <Card>
          <CardHeader title="Topic-wise progress" description="Expand a topic to see its problems" />
          <CardBody className="space-y-2">
            {t.topics.map((group) => {
              const gPct = percent(group.solved, Math.max(group.total, 1));
              const isOpen = open === group.topic_id;
              return (
                <div key={group.topic_id} className="rounded-lg border border-white/[0.07] bg-white/[0.02]">
                  <button
                    onClick={() => setOpen(isOpen ? null : group.topic_id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 p-3.5 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-[13.5px] font-medium text-white">{group.topic_name}</span>
                        <span className="shrink-0 text-[12px] tabular-nums text-slate-400">
                          {group.solved}/{group.total}
                        </span>
                      </div>
                      <ProgressBar value={gPct} className="mt-2" tone="cyan" ariaLabel={`${group.topic_name} progress`} />
                    </div>
                    <ChevronDown
                      className={cn("size-4 shrink-0 text-slate-500 transition-transform", isOpen && "rotate-180")}
                      aria-hidden
                    />
                  </button>

                  {isOpen && (
                    <ul className="divide-y divide-white/[0.05] border-t border-white/[0.06]">
                      {group.problems.map((p) => (
                        <li key={p.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={cn(
                                "size-1.5 shrink-0 rounded-full",
                                p.is_solved ? "bg-emerald-400" : "bg-slate-600",
                              )}
                              aria-hidden
                            />
                            <span className={cn("truncate text-[13px]", p.is_solved ? "text-slate-400" : "text-slate-100")}>
                              {p.title}
                            </span>
                            <DifficultyBadge difficulty={p.difficulty} />
                          </div>
                          <SolveFlow problem={p} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

import { useState } from "react";
import { ArrowRight, Check, Circle, CircleDot, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/StatCard";
import { Badge } from "@/components/common/Badge";
import { Skeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/common/Toast";
import { useRoadmap, useUpdateRoadmapProgress } from "@/lib/api/queries";
import { friendlyMessage } from "@/lib/api/client";
import type { RoadmapSubtopic, RoadmapTopic } from "@/lib/api/types";
import { cn } from "@/utils/cn";

const statusIcon = {
  completed: <Check className="size-3.5 text-emerald-400" aria-hidden />,
  in_progress: <CircleDot className="size-3.5 text-brand-300" aria-hidden />,
  not_started: <Circle className="size-3.5 text-slate-600" aria-hidden />,
};

function SubtopicRow({ topicId, sub }: { topicId: string; sub: RoadmapSubtopic }) {
  const mutate = useUpdateRoadmapProgress();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  const next =
    sub.status === "completed" ? "not_started" : sub.status === "in_progress" ? "completed" : "in_progress";

  const onClick = async () => {
    setPending(true);
    try {
      await mutate.mutateAsync({ roadmap_topic_id: topicId, roadmap_subtopic_id: sub.id, status: next });
      toast({ title: "Roadmap updated", description: `${sub.name} → ${next.replace("_", " ")}`, tone: "success" });
    } catch (error) {
      toast({ title: "Couldn't update roadmap", description: friendlyMessage(error), tone: "error" });
    } finally {
      setPending(false);
    }
  };

  return (
    <li>
      <button
        onClick={onClick}
        disabled={pending}
        aria-label={`Mark ${sub.name} as ${next.replace("_", " ")}`}
        className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/[0.04] disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin text-brand-300" aria-hidden /> : statusIcon[sub.status]}
        <span
          className={cn(
            "text-[13px]",
            sub.status === "completed" ? "text-slate-400 line-through" : "text-slate-200",
            sub.status === "in_progress" && "text-brand-200",
          )}
        >
          {sub.name}
        </span>
      </button>
    </li>
  );
}

function RoadmapTopicCard({ topic }: { topic: RoadmapTopic }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-white">{topic.name}</p>
          <p className="mt-0.5 text-[11.5px] text-slate-500">
            {topic.solved}/{topic.total} problems
          </p>
        </div>
        <Badge tone={topic.status === "completed" ? "success" : topic.status === "in_progress" ? "brand" : "neutral"}>
          {topic.status.replace("_", " ")}
        </Badge>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <ProgressBar value={topic.progress} tone="cyan" ariaLabel={`${topic.name} progress`} />
        <span className="shrink-0 text-[12px] font-medium tabular-nums text-slate-300">{Math.round(topic.progress)}%</span>
      </div>
      <ul className="mt-3 space-y-0.5 border-t border-white/[0.06] pt-3">
        {topic.subtopics.map((s) => (
          <SubtopicRow key={s.id} topicId={topic.id} sub={s} />
        ))}
      </ul>
    </Card>
  );
}

export default function RoadmapPage() {
  const roadmap = useRoadmap();

  if (roadmap.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (roadmap.isError || !roadmap.data) {
    return (
      <ErrorState
        title="We couldn't load the roadmap"
        description="The roadmap API didn't respond."
        onRetry={() => void roadmap.refetch()}
        retrying={roadmap.isFetching}
      />
    );
  }

  const r = roadmap.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="DSA roadmap"
        description="A staged path through every core topic. Progress is user-specific and stored by the backend."
      />

      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[12px] uppercase tracking-wider text-slate-500">Overall progress</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{Math.round(r.overall_progress)}%</p>
            <p className="mt-0.5 text-[12.5px] text-slate-400">
              Currently in <span className="text-accent-400">Stage {r.current_stage}</span>
            </p>
          </div>
          <div className="w-full sm:max-w-md">
            <ProgressBar value={r.overall_progress} tone="cyan" ariaLabel="Overall roadmap progress" />
            <div className="mt-2 flex justify-between text-[11px] text-slate-500">
              {r.stages.map((s) => (
                <span key={s.stage} className={cn(s.stage === r.current_stage && "text-accent-400")}>
                  S{s.stage}
                </span>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {r.stages.length === 0 ? (
        <EmptyState title="No roadmap progress yet" description="Your roadmap will populate as the backend records progress." />
      ) : (
        <div className="space-y-4">
          {r.stages.map((stage) => (
            <Card key={stage.stage}>
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <span className="inline-flex size-5 items-center justify-center rounded-md bg-brand-700 text-[10px] font-bold text-white">
                      {stage.stage}
                    </span>
                    {stage.title}
                    {stage.stage === r.current_stage && <Badge tone="accent">Current</Badge>}
                  </span>
                }
                description={`${Math.round(stage.progress)}% complete`}
                action={
                  <span className="hidden items-center gap-1 text-[12px] text-slate-500 sm:flex">
                    {stage.topics.length} topics <ArrowRight className="size-3" aria-hidden />
                  </span>
                }
              />
              <CardBody>
                <ProgressBar value={stage.progress} className="mb-4" tone="brand" ariaLabel={`Stage ${stage.stage} progress`} />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {stage.topics.map((t) => (
                    <RoadmapTopicCard key={t.id} topic={t} />
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

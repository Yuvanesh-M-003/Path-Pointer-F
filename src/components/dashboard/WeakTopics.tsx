import { Link } from "react-router-dom";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/common/Badge";
import type { TopicMastery } from "@/lib/api/types";

export function WeakTopicsCard({ mastery, limit = 4 }: { mastery: TopicMastery[]; limit?: number }) {
  const weak = mastery
    .filter((m) => m.is_weak || m.mastery_score < 50)
    .sort((a, b) => a.mastery_score - b.mastery_score)
    .slice(0, limit);

  return (
    <Card className="h-full">
      <CardHeader
        title="Weak topics"
        description="Ranked by backend mastery score"
        icon={<TriangleAlert className="size-4" aria-hidden />}
        action={
          <Link
            to="/dashboard/analytics"
            className="text-[12px] font-medium text-brand-300 transition-colors hover:text-brand-200"
          >
            View all
          </Link>
        }
      />
      <CardBody className="space-y-3.5">
        {weak.length === 0 ? (
          <EmptyState
            title="No weak topics detected"
            description="Every topic is above the mastery threshold. Keep the streak going."
          />
        ) : (
          weak.map((t, i) => (
            <div key={t.topic_id}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-[13.5px] font-medium text-slate-100">{t.topic_name}</span>
                  {i === 0 && <Badge tone="accent">Weakest</Badge>}
                </div>
                <span className="shrink-0 font-mono text-[12.5px] font-semibold tabular-nums text-accent-400">
                  {Math.round(t.mastery_score)}%
                </span>
              </div>
              <ProgressBar
                value={t.mastery_score}
                tone="accent"
                className="mt-2"
                ariaLabel={`${t.topic_name} mastery`}
              />
              <div className="mt-1.5 flex items-center justify-between text-[11.5px] text-slate-500">
                <span>
                  {t.solved_count} solved · self-rated {t.self_assessment_score}/10
                </span>
                <Link
                  to={`/dashboard/problems?topic=${encodeURIComponent(t.topic_id)}`}
                  className="inline-flex items-center gap-1 font-medium text-brand-300 transition-colors hover:text-brand-200"
                >
                  Practice <ArrowRight className="size-3" aria-hidden />
                </Link>
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}

export function MasteryCard({ topic }: { topic: TopicMastery }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-white">{topic.topic_name}</p>
          <p className="mt-0.5 text-[11.5px] text-slate-500">
            {topic.solved_count} solved · self {topic.self_assessment_score}/10
          </p>
        </div>
        <Badge tone={topic.mastery_score >= 70 ? "success" : topic.mastery_score >= 45 ? "brand" : "accent"}>
          {topic.mastery_score >= 70 ? "Strong" : topic.mastery_score >= 45 ? "Building" : "Weak"}
        </Badge>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="text-xl font-semibold tabular-nums text-white">{Math.round(topic.mastery_score)}%</span>
      </div>
      <ProgressBar
        value={topic.mastery_score}
        className="mt-2"
        tone={topic.mastery_score < 45 ? "accent" : "cyan"}
        ariaLabel={`${topic.topic_name} mastery`}
      />
      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3 text-center">
        {[
          ["Coverage", topic.coverage_score],
          ["Difficulty", topic.difficulty_score],
          ["Consistency", topic.consistency_score],
        ].map(([label, value]) => (
          <div key={label as string}>
            <dt className="text-[10px] uppercase tracking-wider text-slate-500">{label}</dt>
            <dd className="mt-0.5 text-[12.5px] font-medium tabular-nums text-slate-200">{Math.round(value as number)}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

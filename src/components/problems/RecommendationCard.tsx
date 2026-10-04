import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge, DifficultyBadge, TopicBadge } from "@/components/common/Badge";
import { SolveFlow } from "./ProblemCard";
import type { Recommendation } from "@/lib/api/types";

const priorityTone = { high: "accent", medium: "brand", low: "neutral" } as const;

export function RecommendationCard({ rec, index = 0 }: { rec: Recommendation; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Card className="p-4 transition-colors hover:border-white/[0.16]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14.5px] font-medium text-white">{rec.problem.title}</h3>
              <Badge tone={priorityTone[rec.priority]}>{rec.priority} priority</Badge>
              {rec.status === "completed" && <Badge tone="success">Completed</Badge>}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <DifficultyBadge difficulty={rec.problem.difficulty} />
              <TopicBadge name={rec.problem.topic_name} subtopic={rec.problem.subtopic_name} />
            </div>
          </div>
          <SolveFlow problem={rec.problem} />
        </div>

        <div className="mt-3.5 flex items-start gap-2.5 rounded-lg border border-brand-500/15 bg-brand-500/[0.05] p-3">
          <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-brand-300" aria-hidden />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-300">Why this problem?</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-300">{rec.reason}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { DifficultyBadge, TopicBadge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { useToast } from "@/components/common/Toast";
import { useSolveProblem } from "@/lib/api/queries";
import { friendlyMessage, ApiError } from "@/lib/api/client";
import type { Problem } from "@/lib/api/types";
import { cn } from "@/utils/cn";

export function SolveFlow({
  problem,
  size = "sm",
  onSolved,
}: {
  problem: Problem;
  size?: "sm" | "md";
  onSolved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const solve = useSolveProblem();

  const confirm = async () => {
    try {
      await solve.mutateAsync(problem.id);
      toast({ title: "Marked as solved", description: `${problem.title} added to your progress.`, tone: "success" });
      setOpen(false);
      onSolved?.();
    } catch (error) {
      const conflict = error instanceof ApiError && error.status === 409;
      toast({
        title: conflict ? "Already solved" : "Couldn't save that",
        description: conflict ? "This problem is already counted in your progress." : friendlyMessage(error),
        tone: conflict ? "info" : "error",
      });
      if (conflict) setOpen(false);
    }
  };

  if (problem.is_solved) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 text-[12px] font-medium text-emerald-300">
        <CheckCircle2 className="size-3.5" aria-hidden /> Solved
      </span>
    );
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          size={size}
          variant="secondary"
          onClick={() => window.open(problem.url, "_blank", "noopener,noreferrer")}
          aria-label={`Open ${problem.title} on LeetCode`}
        >
          Solve <ExternalLink className="size-3.5" aria-hidden />
        </Button>
        <Button size={size} variant="outline" onClick={() => setOpen(true)}>
          Mark done
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Mark problem as solved?"
        description={`"${problem.title}" will be recorded in Path Pointer and counted once. Duplicates are prevented by the backend.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={solve.isPending}>
              Cancel
            </Button>
            <Button onClick={confirm} loading={solve.isPending}>
              Yes, I solved it
            </Button>
          </>
        }
      >
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-[13px]">
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            <TopicBadge name={problem.topic_name} subtopic={problem.subtopic_name} />
          </div>
        </div>
      </Modal>
    </>
  );
}

export function ProblemCard({ problem, index = 0 }: { problem: Problem; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.025, 0.25) }}
    >
      <Card
        className={cn(
          "flex flex-col gap-3 p-4 transition-colors hover:border-white/[0.16] sm:flex-row sm:items-center sm:justify-between",
          problem.is_solved && "bg-emerald-500/[0.03]",
        )}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 text-slate-500">
            {problem.is_solved ? (
              <CheckCircle2 className="size-4 text-emerald-400" aria-hidden />
            ) : (
              <Circle className="size-4" aria-hidden />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-white">{problem.title}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <DifficultyBadge difficulty={problem.difficulty} />
              <TopicBadge name={problem.topic_name} subtopic={problem.subtopic_name} />
            </div>
          </div>
        </div>
        <SolveFlow problem={problem} />
      </Card>
    </motion.div>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import type { Difficulty } from "@/lib/api/types";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "accent" | "success" | "warning" | "danger";
  className?: string;
}) {
  const tones = {
    neutral: "bg-white/[0.06] text-slate-300 border-white/10",
    brand: "bg-brand-500/12 text-brand-300 border-brand-500/25",
    accent: "bg-accent-500/12 text-accent-400 border-accent-500/25",
    success: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
    warning: "bg-amber-500/12 text-amber-300 border-amber-500/25",
    danger: "bg-red-500/12 text-red-300 border-red-500/25",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  const map: Record<Difficulty, string> = {
    Easy: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
    Medium: "bg-amber-500/12 text-amber-300 border-amber-500/25",
    Hard: "bg-rose-500/12 text-rose-300 border-rose-500/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold",
        map[difficulty],
        className,
      )}
    >
      {difficulty}
    </span>
  );
}

export function TopicBadge({ name, subtopic }: { name?: string | null; subtopic?: string | null }) {
  if (!name) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-300">
      {name}
      {subtopic && <span className="text-slate-500">· {subtopic}</span>}
    </span>
  );
}

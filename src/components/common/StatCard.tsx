import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { Card } from "./Card";

export function ProgressBar({
  value,
  className,
  tone = "brand",
  showLabel = false,
  ariaLabel,
}: {
  value: number;
  className?: string;
  tone?: "brand" | "accent" | "success" | "cyan";
  showLabel?: boolean;
  ariaLabel?: string;
}) {
  const tones = {
    brand: "bg-gradient-to-r from-brand-600 to-brand-400",
    accent: "bg-gradient-to-r from-accent-600 to-accent-400",
    success: "bg-gradient-to-r from-emerald-600 to-emerald-400",
    cyan: "bg-gradient-to-r from-brand-500 to-cyan-brand",
  } as const;
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel ?? "progress"}
        className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={cn("h-full rounded-full", tones[tone])}
        />
      </div>
      {showLabel && <span className="w-9 shrink-0 text-right text-[11px] font-medium text-slate-400">{pct}%</span>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  progress,
  index = 0,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "accent" | "success";
  progress?: number;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: "easeOut" }}
    >
      <Card className="group relative overflow-hidden p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
          {icon && (
            <span
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-lg border border-white/10",
                tone === "accent" ? "bg-accent-500/10 text-accent-400" : "bg-brand-500/10 text-brand-300",
                tone === "success" && "bg-emerald-500/10 text-emerald-300",
              )}
            >
              {icon}
            </span>
          )}
        </div>
        <p className="mt-2.5 text-2xl font-semibold tracking-tight text-white tabular-nums sm:text-[28px]">{value}</p>
        {hint && <p className="mt-1 text-[12px] text-slate-400">{hint}</p>}
        {progress !== undefined && (
          <ProgressBar value={progress} className="mt-3" tone={tone === "accent" ? "accent" : "brand"} />
        )}
      </Card>
    </motion.div>
  );
}

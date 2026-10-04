import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/utils/cn";

export function ErrorState({
  title = "Something went wrong.",
  description = "We couldn't load this section.",
  onRetry,
  retrying,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "w-full rounded-xl border border-red-500/20 bg-red-500/[0.05] px-5 py-6 text-center sm:text-left",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-300">
          <AlertTriangle className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{description}</p>
        </div>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} loading={retrying}>
            {!retrying && <RefreshCw className="size-3.5" aria-hidden />}
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}

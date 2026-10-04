import { useState } from "react";
import { cn } from "@/utils/cn";

/**
 * Official Path Pointer logo asset — public/logo.png.
 * Never redraw, recolor or stretch it; only the rendered box size changes.
 */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-brand-800 font-bold text-white",
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        PP
      </span>
    );
  }

  return (
    <img
      src="/logo.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("shrink-0 rounded-lg object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function Logo({
  size = 32,
  className,
  showTagline = false,
  labelClassName,
}: {
  size?: number;
  className?: string;
  showTagline?: boolean;
  labelClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className="flex flex-col leading-none">
        <span className={cn("text-[15px] font-semibold tracking-tight text-white", labelClassName)}>
          Path<span className="text-accent-500"> Pointer</span>
        </span>
        {showTagline && (
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
            Coding Practice
          </span>
        )}
      </span>
    </span>
  );
}

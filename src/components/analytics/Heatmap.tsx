import { useMemo, useState } from "react";
import type { DailyPoint } from "@/lib/api/types";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/utils/cn";

const LEVELS = [
  "bg-white/[0.05]",
  "bg-brand-800/70",
  "bg-brand-600/80",
  "bg-brand-500",
  "bg-cyan-brand",
] as const;

function level(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

/** GitHub style contribution grid built from daily_progress rows. */
export function ActivityHeatmap({ data, weeks = 52 }: { data: DailyPoint[]; weeks?: number }) {
  const [hover, setHover] = useState<DailyPoint | null>(null);

  const columns = useMemo(() => {
    const map = new Map(data.map((d) => [d.date, d.count]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));
    const cells: DailyPoint[] = [];
    for (let i = weeks * 7 - 1; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      cells.push({ date: key, count: d > today ? -1 : (map.get(key) ?? 0) });
    }
    const cols: DailyPoint[][] = [];
    for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7));
    return cols;
  }, [data, weeks]);

  const monthLabels = useMemo(
    () =>
      columns.map((col, i) => {
        const first = new Date(col[0].date);
        const prev = i > 0 ? new Date(columns[i - 1][0].date) : null;
        return !prev || first.getMonth() !== prev.getMonth()
          ? first.toLocaleDateString("en-US", { month: "short" })
          : "";
      }),
    [columns],
  );

  return (
    <div className="w-full">
      <div className="pp-scroll -mx-1 overflow-x-auto px-1 pb-2">
        <div className="inline-block min-w-max">
          <div className="mb-1 flex gap-[3px] pl-7">
            {monthLabels.map((m, i) => (
              <span key={i} className="w-[11px] text-[9px] text-slate-500">
                {m}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            <div className="mr-1 flex w-6 flex-col gap-[3px] pt-[1px]">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <span key={i} className="h-[11px] text-[9px] leading-[11px] text-slate-500">
                  {d}
                </span>
              ))}
            </div>
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[3px]">
                {col.map((cell) => (
                  <button
                    type="button"
                    key={cell.date}
                    onMouseEnter={() => cell.count >= 0 && setHover(cell)}
                    onFocus={() => cell.count >= 0 && setHover(cell)}
                    onMouseLeave={() => setHover(null)}
                    onBlur={() => setHover(null)}
                    aria-label={
                      cell.count < 0 ? "Upcoming day" : `${cell.count} problems solved on ${formatDate(cell.date)}`
                    }
                    className={cn(
                      "size-[11px] rounded-[2px] transition-transform hover:scale-125",
                      cell.count < 0 ? "bg-transparent" : LEVELS[level(cell.count)],
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400" role="status" aria-live="polite">
          {hover
            ? `${hover.count} solved · ${formatDate(hover.date, { year: "numeric" })}`
            : `${data.reduce((a, b) => a + b.count, 0)} problems in the last year`}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          Less
          {LEVELS.map((l, i) => (
            <span key={i} className={cn("size-[10px] rounded-[2px]", l)} />
          ))}
          More
        </div>
      </div>
    </div>
  );
}

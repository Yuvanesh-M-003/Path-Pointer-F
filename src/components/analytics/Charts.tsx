import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPoint, Difficulty, TopicMastery } from "@/lib/api/types";
import { abbreviateTopic, formatDate } from "@/lib/utils/format";

const AXIS = { stroke: "rgba(148,163,184,0.55)", fontSize: 11 };
const GRID = "rgba(148,163,184,0.14)";

function useIsMobile(breakpoint = 640) {
  const [is, setIs] = useState(() => (typeof window === "undefined" ? false : window.innerWidth < breakpoint));
  useEffect(() => {
    const onResize = () => setIs(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return is;
}

function TooltipBox({
  active,
  payload,
  label,
  suffix,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string; name?: string; payload?: Record<string, unknown> }>;
  label?: string | number;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  const full = (payload[0]?.payload as { fullName?: string } | undefined)?.fullName;
  return (
    <div className="rounded-lg border border-white/10 bg-navy-850/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="font-medium text-white">{full ?? label}</p>
      {payload.map((p, i) => (
        <p key={i} className="mt-0.5 text-slate-300">
          {p.name}: <span className="font-semibold text-brand-300">{p.value}</span>
          {suffix}
        </p>
      ))}
    </div>
  );
}

/* --------------------------------- radar --------------------------------- */

export function MasteryRadarChart({ data, height = 340 }: { data: TopicMastery[]; height?: number }) {
  const isMobile = useIsMobile(768);
  const points = data
    .slice()
    .sort((a, b) => b.mastery_score - a.mastery_score)
    .slice(0, isMobile ? 8 : 12)
    .map((t) => ({
      topic: abbreviateTopic(t.topic_name),
      fullName: t.topic_name,
      mastery: Math.round(t.mastery_score),
    }));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={points} outerRadius={isMobile ? "68%" : "76%"} margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
          <defs>
            <linearGradient id="ppRadar" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <PolarGrid stroke={GRID} />
          <PolarAngleAxis dataKey="topic" tick={{ fill: "#cbd5e1", fontSize: isMobile ? 9 : 11 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "rgba(148,163,184,0.6)", fontSize: 9 }} stroke={GRID} />
          <Radar
            name="Mastery"
            dataKey="mastery"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#ppRadar)"
            dot={{ r: 2.5, fill: "#22d3ee", strokeWidth: 0 }}
          />
          <Tooltip content={<TooltipBox suffix="%" />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------ difficulty ------------------------------- */

const DIFF_COLORS: Record<Difficulty, string> = { Easy: "#34d399", Medium: "#fbbf24", Hard: "#fb7185" };

export function DifficultyDonut({
  data,
  height = 240,
}: {
  data: Array<{ difficulty: Difficulty; count: number }>;
  height?: number;
}) {
  const total = data.reduce((a, b) => a + b.count, 0);
  return (
    <div style={{ height }} className="relative w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="difficulty"
            innerRadius="58%"
            outerRadius="82%"
            paddingAngle={3}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.difficulty} fill={DIFF_COLORS[d.difficulty]} />
            ))}
          </Pie>
          <Tooltip content={<TooltipBox />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-[11px] text-slate-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-[38%] -translate-y-1/2 text-center">
        <p className="text-xl font-semibold text-white tabular-nums">{total}</p>
        <p className="text-[10px] uppercase tracking-wider text-slate-500">solved</p>
      </div>
    </div>
  );
}

/* -------------------------------- activity -------------------------------- */

export function WeeklyActivityChart({ data, height = 220 }: { data: DailyPoint[]; height?: number }) {
  const points = data.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    date: d.date,
    solved: d.count,
    goal: d.goal ?? null,
  }));
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="28%">
          <defs>
            <linearGradient id="ppBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={AXIS} width={34} />
          <Tooltip cursor={{ fill: "rgba(148,163,184,0.06)" }} content={<TooltipBox />} />
          <Bar dataKey="solved" name="Solved" fill="url(#ppBar)" radius={[5, 5, 2, 2]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyActivityChart({
  data,
  height = 240,
}: {
  data: Array<{ month: string; count: number }>;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="ppArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={AXIS} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={AXIS} width={34} />
          <Tooltip content={<TooltipBox />} />
          <Area
            type="monotone"
            dataKey="count"
            name="Solved"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#ppArea)"
            dot={false}
            activeDot={{ r: 4, fill: "#22d3ee" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* --------------------------- mastery bar (topics) -------------------------- */

export function TopicMasteryBars({ data, height = 320 }: { data: TopicMastery[]; height?: number }) {
  const points = data
    .slice()
    .sort((a, b) => b.mastery_score - a.mastery_score)
    .map((t) => ({ topic: abbreviateTopic(t.topic_name), fullName: t.topic_name, mastery: Math.round(t.mastery_score) }));
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} layout="vertical" margin={{ top: 4, right: 16, left: 6, bottom: 4 }}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={AXIS} />
          <YAxis type="category" dataKey="topic" width={72} tickLine={false} axisLine={false} tick={AXIS} />
          <Tooltip cursor={{ fill: "rgba(148,163,184,0.06)" }} content={<TooltipBox suffix="%" />} />
          <Bar dataKey="mastery" name="Mastery" radius={[2, 5, 5, 2]} maxBarSize={16}>
            {points.map((p) => (
              <Cell key={p.fullName} fill={p.mastery < 45 ? "#f97316" : "#3b82f6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { formatDate };

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  CalendarCheck,
  Compass,
  Flame,
  Gauge,
  ListChecks,
  Map,
  Sparkles,
  Target,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/common/Logo";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { GoogleIcon } from "@/components/common/GoogleIcon";
import { Badge, DifficultyBadge } from "@/components/common/Badge";
import { ProgressBar } from "@/components/common/StatCard";
import { MasteryRadarChart, WeeklyActivityChart } from "@/components/analytics/Charts";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { TopicMastery } from "@/lib/api/types";
import { cn } from "@/utils/cn";

/**
 * Illustrative values used only inside the marketing showcase below.
 * They never appear inside the authenticated product, which always renders
 * live backend data through `src/lib/api`.
 */
const showcaseMastery: TopicMastery[] = [
  ["Arrays", 82],
  ["Strings", 74],
  ["Hashing", 69],
  ["Trees", 58],
  ["Binary Search", 61],
  ["Greedy", 52],
  ["Graphs", 43],
  ["Dynamic Programming", 31],
].map(([topic_name, mastery_score], i) => ({
  topic_id: `s-${i}`,
  topic_name: topic_name as string,
  solved_count: 0,
  coverage_score: 0,
  difficulty_score: 0,
  consistency_score: 0,
  self_assessment_score: 0,
  mastery_score: mastery_score as number,
  is_weak: (mastery_score as number) < 45,
}));

const showcaseWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return { date: d.toISOString().slice(0, 10), count: [3, 5, 2, 4, 6, 1, 4][i] };
});

const whyCards = [
  { icon: Gauge, title: "Smart Progress Tracking", body: "Historical LeetCode baseline plus everything you solve inside Path Pointer, unified into one number." },
  { icon: Target, title: "Dynamic Daily Goals", body: "Your goal adapts to your total solved count so the target always stays realistic and challenging." },
  { icon: Brain, title: "Weak Topic Detection", body: "Mastery scoring surfaces the topics quietly holding your interview performance back." },
  { icon: Sparkles, title: "Personalized Recommendations", body: "Every suggested problem comes with the reason it was chosen for you right now." },
  { icon: Map, title: "Structured Roadmap", body: "A staged path from arrays to dynamic programming, with subtopic level completion." },
  { icon: Flame, title: "Consistency Tracking", body: "Streaks, heatmaps and weekly rollups that reward showing up every single day." },
];

const steps = [
  { n: "01", title: "Create your profile", body: "Continue with Google and connect your LeetCode handle." },
  { n: "02", title: "Rate your DSA knowledge", body: "Score every topic from 0 to 10 with a quick slider pass." },
  { n: "03", title: "Set your baseline", body: "Enter your historical Easy, Medium and Hard solved counts." },
  { n: "04", title: "Get personalized problems", body: "Receive a prioritized queue built around your weakest areas." },
  { n: "05", title: "Improve consistently", body: "Hit daily goals, extend streaks and watch mastery climb." },
];

const features = [
  { icon: BarChart3, title: "Topic Analytics", body: "Radar, distribution and trend views across all 20 topics." },
  { icon: Target, title: "Daily Goals", body: "Backend-calculated targets with live remaining count." },
  { icon: Brain, title: "Weak Topic Detection", body: "Mastery-ranked weaknesses updated after every solve." },
  { icon: Sparkles, title: "Personalized Recommendations", body: "Prioritized problems with an explicit reason." },
  { icon: Activity, title: "Progress Heatmap", body: "A year of daily activity in one contribution grid." },
  { icon: Map, title: "Roadmap Tracking", body: "Five stages, topic progress and subtopic checkpoints." },
  { icon: Compass, title: "Top 150 Problems", body: "A separate topic-wise interview module with its own progress." },
  { icon: Bell, title: "In-App Notifications", body: "Milestones, goal completions and new recommendations." },
];

function GoogleButton({ size = "lg", className }: { size?: "md" | "lg"; className?: string }) {
  const { signInWithGoogle, error } = useAuth();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      /* surfaced through auth error */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Button
        size={size}
        onClick={onClick}
        loading={loading}
        className="w-full bg-white text-navy-900 hover:bg-slate-100 sm:w-auto"
      >
        {!loading && <GoogleIcon className="size-[18px]" />}
        Continue with Google
      </Button>
      {error && (
        <p role="alert" className="text-[12px] text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-brand-300">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-[38px] md:leading-[1.1]">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-[15px] leading-relaxed text-slate-400">{subtitle}</p>}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-navy-900">
      {/* background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 pp-grid-bg opacity-[0.55]" />
        <div className="animate-float-slow absolute -top-40 left-1/2 size-[720px] -translate-x-1/2 rounded-full bg-brand-800/35 blur-[130px]" />
        <div className="absolute -right-40 top-72 size-[420px] rounded-full bg-accent-500/10 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
      </div>

      {/* nav */}
      <header className="relative z-20">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo size={30} showTagline />
          <div className="hidden items-center gap-7 md:flex">
            {[
              ["Why", "#why"],
              ["Product", "#product"],
              ["How it works", "#how"],
              ["Features", "#features"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-[13px] font-medium text-slate-400 transition-colors hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
          <Link to="/login">
            <Button variant="secondary" size="sm">
              Sign in
            </Button>
          </Link>
        </nav>
      </header>

      {/* hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-12 text-center sm:px-6 sm:pb-20 sm:pt-16 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-slate-300 sm:text-[12px]">
            <span className="size-1.5 rounded-full bg-accent-500" />
            DSA practice, structured end to end
          </span>

          <h1 className="mx-auto mt-6 max-w-4xl text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] text-white sm:text-5xl lg:text-[64px]">
            Stop solving randomly.
            <br />
            <span className="bg-gradient-to-r from-brand-300 via-white to-accent-400 bg-clip-text text-transparent">
              Follow a path.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400 sm:text-[17px]">
            Track your DSA journey, identify weak topics, and achieve daily coding goals.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <GoogleButton />
            <p className="text-[12px] text-slate-500">Free to start · No credit card required</p>
          </div>
        </motion.div>

        {/* hero product preview */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative mt-14 sm:mt-16"
        >
          <div className="absolute -inset-x-6 -top-6 bottom-0 rounded-[28px] bg-gradient-to-b from-brand-500/12 to-transparent blur-2xl" aria-hidden />
          <Card className="relative overflow-hidden bg-navy-950/70 p-2 sm:p-3">
            <div className="rounded-lg border border-white/[0.07] bg-navy-900/80">
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2.5">
                <LogoMark size={18} />
                <span className="text-[12px] font-medium text-slate-300">Dashboard</span>
                <span className="ml-auto hidden gap-1.5 sm:flex">
                  {["Roadmap", "Problems", "Analytics"].map((t) => (
                    <span key={t} className="rounded-md px-2 py-1 text-[11px] text-slate-500">
                      {t}
                    </span>
                  ))}
                </span>
              </div>

              <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Total Solved", "168", "132 baseline + 36 in-app"],
                  ["Solved Today", "3", "Goal 4 · 1 remaining"],
                  ["Current Streak", "12", "Longest 27 days"],
                  ["Weekly Progress", "25", "of 28 problems"],
                ].map(([label, value, hint], i) => (
                  <div key={label} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 text-left">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
                    <p className="mt-1.5 text-xl font-semibold text-white tabular-nums">{value}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>
                    <ProgressBar value={[62, 75, 44, 89][i]} className="mt-2.5" tone={i === 1 ? "accent" : "cyan"} />
                  </div>
                ))}
              </div>

              <div className="grid gap-3 border-t border-white/[0.06] p-3 lg:grid-cols-5">
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 lg:col-span-3">
                  <p className="mb-1 text-left text-[12px] font-medium text-slate-300">Topic mastery</p>
                  <MasteryRadarChart data={showcaseMastery} height={260} />
                </div>
                <div className="flex flex-col gap-3 lg:col-span-2">
                  <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
                    <p className="mb-1 text-left text-[12px] font-medium text-slate-300">This week</p>
                    <WeeklyActivityChart data={showcaseWeek} height={140} />
                  </div>
                  <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 text-left">
                    <p className="text-[12px] font-medium text-slate-300">Weak topics</p>
                    {[
                      ["Dynamic Programming", 31],
                      ["Graphs", 43],
                    ].map(([name, val]) => (
                      <div key={name as string} className="mt-2.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">{name}</span>
                          <span className="font-semibold text-accent-400">{val}%</span>
                        </div>
                        <ProgressBar value={val as number} tone="accent" className="mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* why */}
      <section id="why" className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionTitle
          eyebrow="Why Path Pointer"
          title="Practice with direction, not guesswork"
          subtitle="Everything you need to turn scattered problem solving into measurable interview readiness."
        />
        <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {whyCards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: (i % 3) * 0.06 }}
            >
              <Card className="group h-full p-5 transition-colors hover:border-white/[0.16]">
                <span className="inline-flex size-9 items-center justify-center rounded-lg border border-brand-500/25 bg-brand-500/10 text-brand-300 transition-colors group-hover:border-accent-500/30 group-hover:text-accent-400">
                  <c.icon className="size-4.5" aria-hidden />
                </span>
                <h3 className="mt-3.5 text-[15px] font-semibold text-white">{c.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{c.body}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* product showcase */}
      <section id="product" className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
        <SectionTitle
          eyebrow="Inside the product"
          title="Real surfaces from the Path Pointer workspace"
          subtitle="Recommendations, roadmap and progress views built from your live backend data."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <Card className="p-4 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-white">Recommendations</p>
              <Badge tone="accent">Personalized</Badge>
            </div>
            <div className="space-y-2.5">
              {[
                ["Coin Change", "Medium", "Dynamic Programming", "Recommended because your DP mastery is 31%."],
                ["Course Schedule", "Medium", "Graphs", "Strengthens Graphs — your second weakest topic."],
                ["Trapping Rain Water", "Hard", "Arrays", "Balances your difficulty mix this week."],
              ].map(([title, diff, topic, reason]) => (
                <div
                  key={title}
                  className="flex flex-col gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-white">{title}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{reason}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <DifficultyBadge difficulty={diff as "Medium" | "Hard"} />
                    <Badge>{topic}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <p className="mb-3 text-[13px] font-semibold text-white">Roadmap</p>
            <div className="space-y-3">
              {[
                ["Stage 1 · Foundations", 96],
                ["Stage 2 · Linear Structures", 71],
                ["Stage 3 · Trees & Heaps", 48],
                ["Stage 4 · Graphs", 43],
                ["Stage 5 · Optimisation", 31],
              ].map(([label, val]) => (
                <div key={label as string}>
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="text-slate-300">{label}</span>
                    <span className="tabular-nums text-slate-500">{val}%</span>
                  </div>
                  <ProgressBar value={val as number} className="mt-1.5" tone="cyan" />
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
              <p className="text-[12px] font-medium text-white">Arrays subtopics</p>
              <ul className="mt-2 space-y-1.5 text-[12px] text-slate-400">
                <li>✓ Basics</li>
                <li>✓ Prefix Sum</li>
                <li className="text-brand-300">→ Sliding Window</li>
                <li className="text-slate-500">○ Kadane's Algorithm</li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionTitle eyebrow="How it works" title="Five steps to a structured practice loop" />
        <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.32, delay: i * 0.05 }}
            >
              <Card className="relative h-full p-5">
                <span className="font-mono text-[12px] font-medium text-accent-500">{s.n}</span>
                <h3 className="mt-2 text-[14px] font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-400">{s.body}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* features */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
        <SectionTitle eyebrow="Features" title="Built for developers preparing seriously" />
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="bg-navy-900 p-5 transition-colors hover:bg-navy-850">
              <f.icon className="size-4.5 text-brand-400" aria-hidden />
              <h3 className="mt-3 text-[14px] font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        <Card className="relative overflow-hidden bg-gradient-to-b from-brand-800/35 to-transparent px-6 py-12 text-center sm:px-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 pp-grid-bg opacity-40" />
          <div className="relative">
            <LogoMark size={44} className="mx-auto" />
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-[34px]">
              Your next 100 problems, chosen for you.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-slate-400">
              Set your baseline once. Path Pointer handles the rest — goals, mastery, weak topics and what to solve next.
            </p>
            <div className="mt-7 flex flex-col items-center gap-3">
              <GoogleButton />
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-400 transition-colors hover:text-white"
              >
                Explore the sign-in flow <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </Card>
      </section>

      <footer className="relative z-10 border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo size={26} showTagline />
          <div className="flex items-center gap-5 text-[12.5px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="size-3.5" aria-hidden /> 20 topics
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Compass className="size-3.5" aria-hidden /> Top 150
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck className="size-3.5" aria-hidden /> Daily goals
            </span>
          </div>
          <p className="text-[12px] text-slate-600">© {new Date().getFullYear()} Path Pointer</p>
        </div>
      </footer>
    </div>
  );
}

export { GoogleButton };

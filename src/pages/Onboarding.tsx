import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CircleCheck, Loader2 } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { ErrorState } from "@/components/common/ErrorState";
import { PreviewBanner } from "@/components/common/PreviewBanner";
import { Skeleton } from "@/components/common/Skeleton";
import { ProgressBar } from "@/components/common/StatCard";
import { useSubmitOnboarding, useTopics } from "@/lib/api/queries";
import { friendlyMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { cn } from "@/utils/cn";

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-slate-200">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-[12px] text-slate-500">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[12px] text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-[14px] text-white placeholder:text-slate-600 transition-colors focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

function RatingSlider({
  name,
  value,
  onChange,
  index,
}: {
  name: string;
  value: number;
  onChange: (v: number) => void;
  index: number;
}) {
  const id = `rating-${index}`;
  const pct = (value / 10) * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.25) }}
      className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-3"
    >
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="truncate text-[13.5px] font-medium text-slate-200">
          {name}
        </label>
        <span
          className={cn(
            "shrink-0 rounded-md border px-2 py-0.5 font-mono text-[12px] tabular-nums",
            value >= 7
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
              : value >= 4
                ? "border-brand-500/25 bg-brand-500/10 text-brand-300"
                : "border-accent-500/25 bg-accent-500/10 text-accent-400",
          )}
        >
          {value}/10
        </span>
      </div>
      <div className="relative mt-3 h-6">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-brand transition-[width] duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          id={id}
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          aria-valuetext={`${value} out of 10`}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-10 h-6 w-full cursor-pointer"
        />
      </div>
    </motion.div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: topics, isLoading, isError, refetch, isFetching } = useTopics();
  const submit = useSubmitOnboarding();

  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [touchedUsername, setTouchedUsername] = useState(false);
  const [counts, setCounts] = useState({ easy: "", medium: "", hard: "" });
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const usernameError = !username
    ? "LeetCode username is required."
    : !USERNAME_RE.test(username)
      ? "Use 3–30 letters, numbers, hyphens or underscores."
      : null;

  const countError = (raw: string) => {
    if (raw.trim() === "") return "Required.";
    if (!/^\d+$/.test(raw.trim())) return "Whole numbers only.";
    if (Number(raw) < 0) return "Must be 0 or more.";
    if (Number(raw) > 10000) return "That looks too high.";
    return null;
  };

  const countErrors = {
    easy: countError(counts.easy),
    medium: countError(counts.medium),
    hard: countError(counts.hard),
  };

  const ratedCount = useMemo(() => (topics ?? []).filter((t) => ratings[t.id] !== undefined).length, [topics, ratings]);
  const allRated = (topics?.length ?? 0) > 0 && ratedCount === topics?.length;

  const stepValid = [
    !usernameError,
    !countErrors.easy && !countErrors.medium && !countErrors.hard,
    allRated,
  ][step];

  const handleSubmit = async () => {
    if (!topics) return;
    setSubmitError(null);
    try {
      await submit.mutateAsync({
        name: user?.name ?? "Path Pointer User",
        leetcodeUsername: username.trim(),
        easySolved: Number(counts.easy),
        mediumSolved: Number(counts.medium),
        hardSolved: Number(counts.hard),
        topicRatings: topics.map((t) => ({ topicId: t.id, rating: ratings[t.id] ?? 0 })),
      });
      setDone(true);
      window.setTimeout(() => navigate("/dashboard", { replace: true }), 1100);
    } catch (error) {
      setSubmitError(friendlyMessage(error));
    }
  };

  const steps = ["Profile", "Baseline", "Self-assessment"];

  return (
    <div className="relative min-h-screen bg-navy-900">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 pp-grid-bg opacity-40" />
        <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 rounded-full bg-brand-800/25 blur-[140px]" />
      </div>
      <PreviewBanner />

      <header className="relative z-10 mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
        <Logo size={28} showTagline />
        <button
          onClick={() => void signOut()}
          className="text-[12.5px] text-slate-500 transition-colors hover:text-slate-200"
        >
          Sign out
        </button>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex min-h-[60vh] flex-col items-center justify-center text-center"
            >
              <CircleCheck className="size-12 text-emerald-400" aria-hidden />
              <h1 className="mt-4 text-2xl font-semibold text-white">You're all set</h1>
              <p className="mt-2 text-[14px] text-slate-400">Building your first recommendations…</p>
              <Loader2 className="mt-5 size-4 animate-spin text-brand-400" aria-hidden />
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-brand-300">Onboarding</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Let's calibrate your path{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
              </h1>
              <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-slate-400">
                Three quick steps. This sets your baseline so Path Pointer can score mastery and generate accurate
                recommendations.
              </p>

              {/* stepper */}
              <ol className="mt-6 flex items-center gap-2" aria-label="Onboarding steps">
                {steps.map((label, i) => (
                  <li key={label} className="flex flex-1 items-center gap-2">
                    <div className="w-full">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                            i < step
                              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                              : i === step
                                ? "border-accent-500/50 bg-accent-500/15 text-accent-400"
                                : "border-white/10 bg-white/[0.03] text-slate-500",
                          )}
                        >
                          {i < step ? <Check className="size-3" aria-hidden /> : i + 1}
                        </span>
                        <span
                          className={cn(
                            "hidden truncate text-[12.5px] sm:block",
                            i === step ? "font-medium text-white" : "text-slate-500",
                          )}
                        >
                          {label}
                        </span>
                      </div>
                      <ProgressBar value={i < step ? 100 : i === step ? 40 : 0} className="mt-2" tone={i < step ? "success" : "accent"} />
                    </div>
                  </li>
                ))}
              </ol>

              <Card className="mt-6 p-5 sm:p-6">
                {step === 0 && (
                  <div className="space-y-5">
                    <Field
                      id="leetcode"
                      label="LeetCode username"
                      hint="Used to label your profile. Path Pointer never scrapes LeetCode."
                      error={touchedUsername ? usernameError : null}
                    >
                      <input
                        id="leetcode"
                        className={cn(inputClass, touchedUsername && usernameError && "border-red-500/50")}
                        placeholder="e.g. dev_ananya"
                        value={username}
                        autoComplete="off"
                        aria-invalid={Boolean(touchedUsername && usernameError)}
                        aria-describedby={usernameError ? "leetcode-error" : undefined}
                        onBlur={() => setTouchedUsername(true)}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </Field>
                    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3.5 text-[12.5px] leading-relaxed text-slate-400">
                      Signed in as <span className="text-slate-200">{user?.email}</span>. Your Google account stays the
                      source of identity — the username is only a display handle.
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <p className="text-[13px] leading-relaxed text-slate-400">
                      Enter how many problems you have already solved before joining. This becomes your historical
                      baseline and is added to everything you solve inside Path Pointer.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {(["easy", "medium", "hard"] as const).map((key) => (
                        <Field
                          key={key}
                          id={`count-${key}`}
                          label={`${key[0].toUpperCase()}${key.slice(1)} solved`}
                          error={counts[key] !== "" ? countErrors[key] : null}
                        >
                          <input
                            id={`count-${key}`}
                            className={cn(inputClass, counts[key] !== "" && countErrors[key] && "border-red-500/50")}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0"
                            value={counts[key]}
                            aria-invalid={Boolean(counts[key] !== "" && countErrors[key])}
                            onChange={(e) => setCounts((c) => ({ ...c, [key]: e.target.value.replace(/[^\d]/g, "") }))}
                          />
                        </Field>
                      ))}
                    </div>
                    <div className="rounded-lg border border-brand-500/20 bg-brand-500/[0.06] p-3.5 text-[12.5px] text-slate-300">
                      Baseline total:{" "}
                      <span className="font-semibold text-white tabular-nums">
                        {(Number(counts.easy) || 0) + (Number(counts.medium) || 0) + (Number(counts.hard) || 0)}
                      </span>{" "}
                      problems
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] leading-relaxed text-slate-400">
                        Rate your confidence in each topic from 0 to 10.
                      </p>
                      <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11.5px] tabular-nums text-slate-300">
                        {ratedCount}/{topics?.length ?? 0} rated
                      </span>
                    </div>

                    {isLoading && (
                      <div className="mt-4 space-y-2.5">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={i} className="h-[76px] w-full rounded-lg" />
                        ))}
                      </div>
                    )}

                    {isError && (
                      <ErrorState
                        className="mt-4"
                        title="We couldn't load the topic list"
                        description="Path Pointer needs the topics API to record your self-assessment."
                        onRetry={() => void refetch()}
                        retrying={isFetching}
                      />
                    )}

                    {topics && (
                      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                        {topics.map((t, i) => (
                          <RatingSlider
                            key={t.id}
                            index={i}
                            name={t.name}
                            value={ratings[t.id] ?? 0}
                            onChange={(v) => setRatings((r) => ({ ...r, [t.id]: v }))}
                          />
                        ))}
                      </div>
                    )}

                    {topics && !allRated && (
                      <p className="mt-3 text-[12px] text-slate-500">
                        Move every slider at least once (including leaving it at 0) to continue.
                      </p>
                    )}

                    {submitError && (
                      <ErrorState
                        className="mt-4"
                        title="We couldn't save your onboarding"
                        description={submitError}
                        onRetry={handleSubmit}
                        retrying={submit.isPending}
                      />
                    )}
                  </div>
                )}

                <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
                  <Button
                    variant="ghost"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0 || submit.isPending}
                  >
                    <ArrowLeft className="size-3.5" aria-hidden /> Back
                  </Button>

                  {step < 2 ? (
                    <Button
                      onClick={() => {
                        if (step === 0) setTouchedUsername(true);
                        if (stepValid) setStep((s) => s + 1);
                      }}
                      disabled={!stepValid}
                    >
                      Continue <ArrowRight className="size-3.5" aria-hidden />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={!stepValid} loading={submit.isPending} variant="accent">
                      Finish onboarding
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

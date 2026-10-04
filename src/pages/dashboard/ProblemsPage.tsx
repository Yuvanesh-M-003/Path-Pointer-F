import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Search, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/common/Card";
import { ListSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/common/Button";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { useProblems, useTopics } from "@/lib/api/queries";
import { cn } from "@/utils/cn";

const selectClass =
  "h-10 w-full rounded-lg border border-white/10 bg-navy-850 px-3 text-[13px] text-slate-200 transition-colors focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

export default function ProblemsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [debounced, setDebounced] = useState(search);
  const [topicId, setTopicId] = useState(params.get("topic") ?? "");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState<"" | "solved" | "unsolved">("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(search), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (debounced) next.set("q", debounced);
    if (topicId) next.set("topic", topicId);
    setParams(next, { replace: true });
  }, [debounced, topicId, setParams]);

  const topics = useTopics();
  const filters = useMemo(
    () => ({ search: debounced || undefined, topic_id: topicId || undefined, difficulty: difficulty || undefined, status }),
    [debounced, topicId, difficulty, status],
  );
  const problems = useProblems(filters);

  const activeFilters = [topicId, difficulty, status].filter(Boolean).length;
  const clearAll = () => {
    setTopicId("");
    setDifficulty("");
    setStatus("");
    setSearch("");
  };

  return (
    <div>
      <PageHeader
        title="Problem library"
        description="Browse every problem available in Path Pointer. Solved problems are tracked individually — historical baseline counts are aggregate only."
      />

      <Card className="mb-4">
        <CardBody className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden />
              <label htmlFor="problem-search" className="sr-only">
                Search problems by title
              </label>
              <input
                id="problem-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problem title…"
                className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-9 pr-9 text-[13.5px] text-white placeholder:text-slate-600 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-200"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              )}
            </div>
            <Button
              variant="secondary"
              className="sm:hidden"
              onClick={() => setShowFilters((s) => !s)}
              aria-expanded={showFilters}
            >
              <Filter className="size-4" aria-hidden />
              {activeFilters > 0 && <span className="text-accent-400">{activeFilters}</span>}
            </Button>
          </div>

          <div className={cn("grid gap-2 sm:grid-cols-3", !showFilters && "hidden sm:grid")}>
            <div>
              <label htmlFor="f-topic" className="sr-only">
                Filter by topic
              </label>
              <select id="f-topic" className={selectClass} value={topicId} onChange={(e) => setTopicId(e.target.value)}>
                <option value="">All topics</option>
                {(topics.data ?? []).map((t) => (
                  <option key={t.id} value={t.slug ?? t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="f-diff" className="sr-only">
                Filter by difficulty
              </label>
              <select
                id="f-diff"
                className={selectClass}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="">All difficulties</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label htmlFor="f-status" className="sr-only">
                Filter by solved status
              </label>
              <select
                id="f-status"
                className={selectClass}
                value={status}
                onChange={(e) => setStatus(e.target.value as "" | "solved" | "unsolved")}
              >
                <option value="">Solved & unsolved</option>
                <option value="solved">Solved only</option>
                <option value="unsolved">Unsolved only</option>
              </select>
            </div>
          </div>

          {activeFilters > 0 && (
            <button onClick={clearAll} className="text-[12px] text-slate-400 underline-offset-2 hover:text-white hover:underline">
              Clear filters
            </button>
          )}
        </CardBody>
      </Card>

      {problems.isLoading ? (
        <ListSkeleton rows={6} />
      ) : problems.isError ? (
        <ErrorState
          title="We couldn't load the problem library"
          description="The problems API didn't respond."
          onRetry={() => void problems.refetch()}
          retrying={problems.isFetching}
        />
      ) : (problems.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="No problems match those filters"
          description="Try widening your search or clearing the filters."
          action={
            <Button variant="secondary" size="sm" onClick={clearAll}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <p className="mb-3 text-[12.5px] text-slate-500">
            {problems.data!.total} problem{problems.data!.total === 1 ? "" : "s"}
          </p>
          <div className="space-y-2.5">
            {problems.data!.items.map((p, i) => (
              <ProblemCard key={p.id} problem={p} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export const clampNumber = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function formatNumber(value: number | undefined | null) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(input: string | Date, opts: Intl.DateTimeFormatOptions = {}) {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", ...opts }).format(d);
}

export function relativeTime(input: string | Date) {
  const d = typeof input === "string" ? new Date(input) : input;
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

/** Short label used on mobile radar charts so topic names never overlap. */
export function abbreviateTopic(name: string) {
  const overrides: Record<string, string> = {
    "Dynamic Programming": "DP",
    "Binary Search Tree": "BST",
    "Heap / Priority Queue": "Heap",
    "Math / Number Theory": "Math",
    "Bit Manipulation": "Bits",
    "Sliding Window": "Window",
    "Two Pointer": "2-Ptr",
    "Linked List": "L.List",
    "Binary Search": "BinSrch",
    "Segment Tree": "SegTree",
    Backtracking: "Backtr",
  };
  if (overrides[name]) return overrides[name];
  return name.length > 9 ? `${name.slice(0, 8)}…` : name;
}

export function percent(value: number, total: number) {
  if (!total) return 0;
  return clampNumber(Math.round((value / total) * 100), 0, 100);
}

export function initials(name?: string | null) {
  if (!name) return "PP";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

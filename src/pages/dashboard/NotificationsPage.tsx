import { Bell, BellOff, CheckCheck, Flame, Map, Sparkles, Target, TriangleAlert, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/common/Toast";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/lib/api/queries";
import { friendlyMessage } from "@/lib/api/client";
import { relativeTime } from "@/lib/utils/format";
import type { AppNotification } from "@/lib/api/types";
import { cn } from "@/utils/cn";

const icons: Record<AppNotification["type"], typeof Bell> = {
  daily_goal_completed: Target,
  new_recommendation: Sparkles,
  weak_topic_detected: TriangleAlert,
  streak_milestone: Flame,
  top_150_milestone: Compass,
  roadmap_milestone: Map,
};

function NotificationItem({ n, index }: { n: AppNotification; index: number }) {
  const markRead = useMarkNotificationRead();
  const { toast } = useToast();
  const Icon = icons[n.type] ?? Bell;

  const onRead = async () => {
    try {
      await markRead.mutateAsync(n.id);
    } catch (error) {
      toast({ title: "Couldn't update notification", description: friendlyMessage(error), tone: "error" });
    }
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.25) }}
    >
      <Card className={cn("flex items-start gap-3 p-4", !n.read && "border-brand-500/25 bg-brand-500/[0.05]")}>
        <span
          className={cn(
            "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border",
            n.read ? "border-white/10 bg-white/[0.03] text-slate-400" : "border-accent-500/25 bg-accent-500/10 text-accent-400",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13.5px] font-medium text-white">
              {n.title}
              {!n.read && <span className="ml-2 inline-block size-1.5 rounded-full bg-accent-500" aria-label="unread" />}
            </p>
            <span className="shrink-0 text-[11.5px] text-slate-500">{relativeTime(n.created_at)}</span>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-400">{n.body}</p>
          {!n.read && (
            <button
              onClick={onRead}
              disabled={markRead.isPending}
              className="mt-2 text-[12px] font-medium text-brand-300 transition-colors hover:text-brand-200 disabled:opacity-50"
            >
              Mark as read
            </button>
          )}
        </div>
      </Card>
    </motion.li>
  );
}

export default function NotificationsPage() {
  const notifications = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const { toast } = useToast();

  const unread = (notifications.data ?? []).filter((n) => !n.read).length;

  const onMarkAll = async () => {
    try {
      await markAll.mutateAsync();
      toast({ title: "All notifications marked as read", tone: "success" });
    } catch (error) {
      toast({ title: "Couldn't update notifications", description: friendlyMessage(error), tone: "error" });
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "You're all caught up."}
        action={
          <Button variant="secondary" size="sm" onClick={onMarkAll} loading={markAll.isPending} disabled={!unread}>
            <CheckCheck className="size-3.5" aria-hidden /> Mark all read
          </Button>
        }
      />

      {notifications.isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[86px] w-full rounded-xl" />
          ))}
        </div>
      ) : notifications.isError ? (
        <ErrorState
          title="We couldn't load your notifications"
          description="The notifications API didn't respond."
          onRetry={() => void notifications.refetch()}
          retrying={notifications.isFetching}
        />
      ) : (notifications.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={<BellOff className="size-5" aria-hidden />}
          title="No notifications"
          description="Goal completions, streak milestones and weak topic alerts will show up here."
        />
      ) : (
        <ul className="space-y-2.5">
          {notifications.data!.map((n, i) => (
            <NotificationItem key={n.id} n={n} index={i} />
          ))}
        </ul>
      )}
    </div>
  );
}

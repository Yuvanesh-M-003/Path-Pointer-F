import { useEffect, useState } from "react";
import { LogOut, Mail, ShieldCheck, User as UserIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Skeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { useToast } from "@/components/common/Toast";
import { useProfile, useProgress, useUpdateProfile } from "@/lib/api/queries";
import { friendlyMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatDate, initials } from "@/lib/utils/format";
import { isSupabaseConfigured } from "@/lib/env";

const inputClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[13.5px] text-white placeholder:text-slate-600 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const profile = useProfile();
  const progress = useProgress();
  const update = useUpdateProfile();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [leetcode, setLeetcode] = useState("");

  useEffect(() => {
    if (profile.data) {
      setFullName(profile.data.full_name ?? "");
      setLeetcode(profile.data.leetcode_username ?? "");
    }
  }, [profile.data]);

  const dirty =
    profile.data && (fullName !== (profile.data.full_name ?? "") || leetcode !== (profile.data.leetcode_username ?? ""));

  const save = async () => {
    try {
      await update.mutateAsync({ full_name: fullName.trim(), leetcode_username: leetcode.trim() });
      toast({ title: "Profile updated", tone: "success" });
    } catch (error) {
      toast({ title: "Couldn't save your profile", description: friendlyMessage(error), tone: "error" });
    }
  };

  if (profile.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <ErrorState
        title="We couldn't load your profile"
        description="The profile API didn't respond."
        onRetry={() => void profile.refetch()}
        retrying={profile.isFetching}
      />
    );
  }

  const p = profile.data;

  return (
    <div className="space-y-5">
      <PageHeader title="Profile" description="Your Path Pointer account and onboarding information." />

      <Card>
        <CardBody className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="size-16 rounded-xl object-cover" />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-xl bg-brand-700 text-xl font-semibold text-white">
              {initials(p.full_name ?? user?.name)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-white">{p.full_name ?? user?.name ?? "Developer"}</p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] text-slate-400">
              <Mail className="size-3.5" aria-hidden /> {p.email ?? user?.email}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="brand">LeetCode: {p.leetcode_username ?? "not set"}</Badge>
              <Badge tone={p.onboarding_completed ? "success" : "warning"}>
                {p.onboarding_completed ? "Onboarding complete" : "Onboarding pending"}
              </Badge>
              {p.created_at && <Badge>Joined {formatDate(p.created_at, { year: "numeric" })}</Badge>}
            </div>
          </div>
          <Button variant="danger" onClick={() => void signOut()} className="w-full sm:w-auto">
            <LogOut className="size-4" aria-hidden /> Log out
          </Button>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Account details" icon={<UserIcon className="size-4" aria-hidden />} />
          <CardBody className="space-y-4">
            <div>
              <label htmlFor="pf-name" className="block text-[13px] font-medium text-slate-200">
                Display name
              </label>
              <input
                id="pf-name"
                className={`${inputClass} mt-2`}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pf-leetcode" className="block text-[13px] font-medium text-slate-200">
                LeetCode username
              </label>
              <input
                id="pf-leetcode"
                className={`${inputClass} mt-2`}
                value={leetcode}
                onChange={(e) => setLeetcode(e.target.value)}
              />
              <p className="mt-1.5 text-[12px] text-slate-500">Display handle only — Path Pointer never scrapes LeetCode.</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={save} disabled={!dirty} loading={update.isPending}>
                Save changes
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Onboarding baseline" description="Recorded when you joined" />
          <CardBody>
            {progress.isLoading ? (
              <Skeleton className="h-24 w-full rounded-lg" />
            ) : progress.data ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {(["easy", "medium", "hard"] as const).map((k) => (
                    <div key={k} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 text-center">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">{k}</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-white">{progress.data!.baseline[k]}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[12.5px] leading-relaxed text-slate-400">
                  Historical baseline is an aggregate total. Individual problems are only marked solved when you record
                  them inside Path Pointer.
                </p>
              </>
            ) : (
              <p className="text-[13px] text-slate-400">Baseline unavailable.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Security" icon={<ShieldCheck className="size-4" aria-hidden />} />
        <CardBody className="space-y-2 text-[12.5px] leading-relaxed text-slate-400">
          <p>
            Authentication provider:{" "}
            <span className="text-slate-200">{isSupabaseConfigured ? "Supabase Auth · Google OAuth" : "Not configured"}</span>
          </p>
          <p>
            Path Pointer only stores your name, email and avatar from Google. All authorization checks are enforced by
            the backend against your authenticated session.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Logo } from "@/components/common/Logo";
import { PreviewBanner } from "@/components/common/PreviewBanner";
import { GoogleButton } from "./Landing";

export default function Login() {
  return (
    <div className="relative flex min-h-screen flex-col bg-navy-900">
      <PreviewBanner />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 pp-grid-bg opacity-50" />
        <div className="absolute left-1/2 top-0 size-[560px] -translate-x-1/2 rounded-full bg-brand-800/30 blur-[130px]" />
      </div>

      <header className="relative z-10 mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo size={28} showTagline />
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" aria-hidden /> Back
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="p-6 sm:p-8">
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Welcome to Path Pointer</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-400">
              Sign in to continue your DSA path — your progress, goals and recommendations are waiting.
            </p>

            <div className="mt-7">
              <GoogleButton size="lg" className="w-full [&>button]:w-full" />
            </div>

            <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-400" aria-hidden />
              <p className="text-[12px] leading-relaxed text-slate-400">
                Authentication is handled by Supabase Auth with Google OAuth. Path Pointer never stores your password
                and only requests your name, email and avatar.
              </p>
            </div>

            <ul className="mt-6 space-y-2 text-[12.5px] text-slate-400">
              {[
                "Baseline + in-app solved counts in one place",
                "Mastery scoring across 20 DSA topics",
                "Daily goals that adapt as you improve",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="size-1 rounded-full bg-accent-500" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <p className="mt-5 text-center text-[12px] leading-relaxed text-slate-500">
            By continuing you agree to the Path Pointer terms of service and privacy policy.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

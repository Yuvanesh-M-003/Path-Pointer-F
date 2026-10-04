import { LogoMark } from "./Logo";

export function FullPageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-navy-900 px-6">
      <div className="relative">
        <span className="absolute -inset-4 animate-ping rounded-full bg-brand-500/10" aria-hidden />
        <LogoMark size={44} />
      </div>
      <p className="text-sm text-slate-400" role="status" aria-live="polite">
        {label}
      </p>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full w-1/3 animate-[pp-slide_1.4s_ease-in-out_infinite] rounded-full bg-brand-500" />
      </div>
      <style>{`@keyframes pp-slide{0%{transform:translateX(-100%)}100%{transform:translateX(320%)}}`}</style>
    </div>
  );
}

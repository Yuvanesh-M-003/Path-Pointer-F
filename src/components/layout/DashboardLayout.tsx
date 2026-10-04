import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, LogOut, Menu, Search, X } from "lucide-react";
import { Logo, LogoMark } from "@/components/common/Logo";
import { PreviewBanner } from "@/components/common/PreviewBanner";
import { primaryNav, secondaryNav, type NavItem } from "@/components/navigation/nav-items";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useNotifications, useProfile } from "@/lib/api/queries";
import { initials } from "@/lib/utils/format";
import { cn } from "@/utils/cn";

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                isActive ? "bg-white/[0.07] text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "absolute left-0 h-4.5 w-[2px] rounded-r-full bg-accent-500 transition-opacity",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                />
                <item.icon className={cn("size-4 shrink-0", isActive ? "text-accent-400" : "text-slate-500")} aria-hidden />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-4">
        <Logo size={26} />
      </div>
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Practice</p>
        <NavList items={primaryNav} onNavigate={onNavigate} />
        <p className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Account</p>
        <NavList items={secondaryNav} onNavigate={onNavigate} />
      </nav>
      <div className="border-t border-white/[0.06] p-3">
        <div className="rounded-lg border border-white/[0.07] bg-gradient-to-br from-brand-800/40 to-transparent p-3">
          <p className="text-[12px] font-semibold text-white">Stay on the path</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Consistency beats intensity. Solve today's goal to keep your streak alive.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: notifications } = useNotifications();
  const unread = (notifications ?? []).filter((n) => !n.read).length;

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const displayName = profile?.full_name ?? user?.name ?? "Developer";

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(1000px_500px_at_75%_-10%,rgba(30,58,138,0.35),transparent)]"
      />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-white/[0.07] bg-navy-950/70 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 h-full w-full bg-navy-950/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="absolute inset-y-0 left-0 w-[82%] max-w-[290px] border-r border-white/10 bg-navy-950"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="absolute right-3 top-3.5 rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="size-4" aria-hidden />
              </button>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-navy-900/85 backdrop-blur-xl">
          <PreviewBanner />
          <div className="flex h-14 items-center gap-2 px-3 sm:px-5">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </button>
            <span className="lg:hidden">
              <LogoMark size={24} />
            </span>

            <button
              onClick={() => navigate("/dashboard/problems")}
              className="ml-1 hidden h-9 flex-1 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[13px] text-slate-500 transition-colors hover:border-white/15 hover:text-slate-300 md:flex md:max-w-xs"
            >
              <Search className="size-3.5" aria-hidden />
              Search problems…
            </button>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <NavLink
                to="/dashboard/notifications"
                aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
                className="relative rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Bell className="size-[18px]" aria-hidden />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex min-w-[15px] items-center justify-center rounded-full bg-accent-500 px-1 text-[9px] font-bold leading-[15px] text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/dashboard/profile"
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] py-1 pl-1 pr-1 transition-colors hover:border-white/15 sm:pr-2.5"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="size-7 rounded-md object-cover" />
                ) : (
                  <span className="flex size-7 items-center justify-center rounded-md bg-brand-700 text-[11px] font-semibold text-white">
                    {initials(displayName)}
                  </span>
                )}
                <span className="hidden max-w-[120px] truncate text-[13px] font-medium text-slate-200 sm:block">
                  {displayName}
                </span>
              </NavLink>

              <button
                onClick={() => void signOut()}
                aria-label="Sign out"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <LogOut className="size-[17px]" aria-hidden />
              </button>
            </div>
          </div>
        </header>

        <main className="relative mx-auto w-full max-w-[1400px] px-3 py-5 sm:px-5 sm:py-6 lg:px-7">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

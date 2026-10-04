import {
  BarChart3,
  Bell,
  Compass,
  LayoutDashboard,
  ListChecks,
  Map,
  Sparkles,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export const primaryNav: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Roadmap", to: "/dashboard/roadmap", icon: Map },
  { label: "Problems", to: "/dashboard/problems", icon: ListChecks },
  { label: "Recommendations", to: "/dashboard/recommendations", icon: Sparkles },
  { label: "Progress", to: "/dashboard/progress", icon: TrendingUp },
  { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
  { label: "Top Problems", to: "/dashboard/top-150", icon: Compass },
];

export const secondaryNav: NavItem[] = [
  { label: "Notifications", to: "/dashboard/notifications", icon: Bell },
  { label: "Profile", to: "/dashboard/profile", icon: User },
];

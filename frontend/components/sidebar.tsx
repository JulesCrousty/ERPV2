"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CubeIcon,
  UsersIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  QueueListIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/ui/button";
import { useSidebar } from "@/hooks/useSidebar";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/(modules)/fi", label: "Finance", icon: BanknotesIcon },
  { href: "/(modules)/mm", label: "MM", icon: ShoppingBagIcon },
  { href: "/(modules)/sd", label: "SD", icon: ClipboardDocumentListIcon },
  { href: "/(modules)/wm", label: "WM", icon: CubeIcon },
  { href: "/(modules)/pp", label: "PP", icon: QueueListIcon },
  { href: "/(modules)/hr/core", label: "HR", icon: UsersIcon },
  { href: "/(modules)/workflow", label: "Workflow", icon: Cog6ToothIcon },
  { href: "/(modules)/analytics", label: "Analytics", icon: ChartBarIcon }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "sidebar-gradient text-white shadow-xl transition-all duration-200",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="flex items-center justify-between px-5 py-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-300">ERP Suite</p>
          {!collapsed && <h2 className="text-2xl font-semibold">Aurora</h2>}
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={toggle}>
          <QueueListIcon className="h-5 w-5" />
        </Button>
      </div>
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-white/10",
                  active ? "bg-white/10" : "text-slate-200"
                )}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && item.label}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-5 py-6 space-y-3">
        <Button
          variant="outline"
          className="w-full justify-between border-white/20 bg-white/10 text-white hover:bg-white/20"
          onClick={toggleTheme}
        >
          {!collapsed && <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>}
          {theme === "dark" ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        </Button>
        <Button
          variant="secondary"
          className="w-full justify-between bg-white/15 text-white hover:bg-white/25"
          onClick={() => logout()}
        >
          {!collapsed && <span>Logout</span>}
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
        </Button>
      </div>
    </aside>
  );
}

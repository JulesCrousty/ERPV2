"use client";

import { BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

function buildBreadcrumb(pathname: string) {
  const parts = pathname.split("/").filter(Boolean).filter((part) => part !== "(modules)" && part !== "(auth)");
  if (!parts.length) return "Dashboard";
  return parts
    .map((part) => part.replace(/-/g, " "))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");
}

export default function Header() {
  const pathname = usePathname();
  const { session } = useAuth();
  const label = buildBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/80 px-8 py-4 header-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-primary/10 px-3 py-2 text-primary text-sm font-medium">{label}</div>
        <div className="relative hidden md:block">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search" className="pl-10 w-64 bg-white/70 dark:bg-slate-800/60" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary">
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
          <Avatar>
            <AvatarFallback className="bg-primary/20 text-primary">
              {session?.user?.name?.slice(0, 2).toUpperCase() || "GU"}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm leading-tight">
            <p className="font-medium text-text dark:text-white">{session?.user?.name || "Guest User"}</p>
            <p className={cn("text-xs", session?.user ? "text-slate-500" : "text-amber-500")}>{session?.user?.role || "No session"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

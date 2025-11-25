"use client";

import { cn } from "@/lib/utils";

interface LoaderProps {
  label?: string;
  className?: string;
}

export function Loader({ label = "Loading...", className }: LoaderProps) {
  return (
    <div className={cn("flex items-center gap-3 text-slate-500", className)}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      <span className="text-sm" role="status">
        {label}
      </span>
    </div>
  );
}

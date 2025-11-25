import { ArrowUpRightIcon, ArrowDownRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
}

export function KpiCard({ label, value, change, icon }: KpiCardProps) {
  const isPositive = change !== undefined ? change >= 0 : undefined;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-card border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <span className="text-primary">{icon}</span>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-2xl font-semibold text-text dark:text-white">{value}</p>
        {isPositive !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              isPositive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            )}
          >
            {isPositive ? <ArrowUpRightIcon className="h-4 w-4" /> : <ArrowDownRightIcon className="h-4 w-4" />}
            {Math.abs(change ?? 0)}%
          </span>
        )}
      </div>
    </div>
  );
}

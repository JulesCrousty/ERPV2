import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function Card({ title, description, children, className, actions }: CardProps) {
  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-2xl shadow-card p-6 border border-slate-100 dark:border-slate-800", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            {title && <h3 className="text-lg font-semibold text-text dark:text-white">{title}</h3>}
            {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;

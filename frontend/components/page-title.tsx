interface PageTitleProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageTitle({ title, subtitle, actions }: PageTitleProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
      <div>
        <p className="text-xs uppercase tracking-wide text-primary">Enterprise Suite</p>
        <h1 className="text-2xl font-semibold text-text dark:text-white">{title}</h1>
        {subtitle && <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

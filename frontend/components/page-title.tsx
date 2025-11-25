interface PageTitleProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageTitle({ title, subtitle, actions }: PageTitleProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-text dark:text-white">{title}</h1>
        {subtitle && <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

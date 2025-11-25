import Link from "next/link";
import { BanknotesIcon, ClipboardDocumentListIcon, CubeIcon, QueueListIcon, UsersIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import Card from "@/components/card";
import { KpiCard } from "@/components/kpi-card";
import { PageTitle } from "@/components/page-title";

const modules = [
  {
    title: "Finance",
    description: "General ledger, journals and tax reporting.",
    href: "/(modules)/fi",
    icon: <BanknotesIcon className="h-8 w-8 text-primary" />
  },
  {
    title: "Purchasing / MM",
    description: "Vendors, purchase orders and procurement.",
    href: "/(modules)/mm",
    icon: <ShoppingBagIcon className="h-8 w-8 text-primary" />
  },
  {
    title: "Sales / SD",
    description: "Quotes, sales orders and billing automation.",
    href: "/(modules)/sd",
    icon: <ClipboardDocumentListIcon className="h-8 w-8 text-primary" />
  },
  {
    title: "Inventory / WM",
    description: "Stock, warehouses and real-time tracking.",
    href: "/(modules)/wm",
    icon: <CubeIcon className="h-8 w-8 text-primary" />
  },
  {
    title: "Production / PP",
    description: "Production orders, capacity and shop floor.",
    href: "/(modules)/pp",
    icon: <QueueListIcon className="h-8 w-8 text-primary" />
  },
  {
    title: "HR Suite",
    description: "Core HR, time tracking and payroll.",
    href: "/(modules)/hr/core",
    icon: <UsersIcon className="h-8 w-8 text-primary" />
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageTitle title="ERP Command Center" subtitle="Overview of all functional areas" />
      <div className="grid gap-6 md:grid-cols-3">
        <KpiCard label="Revenue" value="$1.2M" change={12} />
        <KpiCard label="Procurement" value="$420K" change={4} />
        <KpiCard label="Open Orders" value="326" change={-2} />
      </div>
      <div className="card-grid">
        {modules.map((module) => (
          <Link key={module.title} href={module.href}>
            <Card
              className="hover:-translate-y-1 transition-transform cursor-pointer"
              title={module.title}
              description={module.description}
              actions={<span className="text-primary text-sm font-medium">Open</span>}
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                {module.icon}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Key insights and shortcuts tailored for your team.</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

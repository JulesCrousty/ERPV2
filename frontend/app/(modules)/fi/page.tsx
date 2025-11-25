"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { DataTable } from "@/components/data-table";
import Card from "@/components/card";
import { PageTitle } from "@/components/page-title";
import { FinancialDocument } from "@/types/fi";
import { Badge } from "@/ui/badge";

const documents: FinancialDocument[] = [
  { id: "FI-1001", type: "Journal", amount: 12500, currency: "USD", status: "Posted", date: "2024-07-01" },
  { id: "FI-1002", type: "Invoice", amount: 9800, currency: "EUR", status: "Open", date: "2024-07-02" },
  { id: "FI-1003", type: "Tax", amount: 4500, currency: "USD", status: "Draft", date: "2024-07-03" }
];

const columns: ColumnDef<FinancialDocument>[] = [
  { header: "Document", accessorKey: "id" },
  { header: "Type", accessorKey: "type" },
  {
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-semibold text-text dark:text-white">
        {row.original.amount.toLocaleString()} {row.original.currency}
      </span>
    )
  },
  {
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>
  },
  { header: "Date", accessorKey: "date" }
];

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Finance" subtitle="Balance sheets, journals and compliance" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Balance" description="Current month" className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-3 text-3xl font-semibold text-text dark:text-white">
            <BanknotesIcon className="h-8 w-8 text-primary" />$245,800
          </div>
        </Card>
        <Card title="Open Journals" description="Awaiting posting">
          <p className="text-2xl font-semibold">18</p>
        </Card>
        <Card title="Tax Items" description="Pending submissions">
          <p className="text-2xl font-semibold">7</p>
        </Card>
      </div>
      <Card title="Documents" description="Latest financial entries">
        <DataTable columns={columns} data={documents} />
      </Card>
    </div>
  );
}

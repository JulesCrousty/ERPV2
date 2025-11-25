"use client";

import { ColumnDef } from "@tanstack/react-table";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { PayrollRecord } from "@/types/hr";

const payroll: PayrollRecord[] = [
  { id: "PR-01", employee: "Marie Curie", grossPay: 8200, deductions: 1200, netPay: 7000, payDate: "2024-06-30" },
  { id: "PR-02", employee: "Alan Turing", grossPay: 9200, deductions: 1800, netPay: 7400, payDate: "2024-06-30" },
  { id: "PR-03", employee: "Ada Lovelace", grossPay: 7800, deductions: 900, netPay: 6900, payDate: "2024-06-30" }
];

const columns: ColumnDef<PayrollRecord>[] = [
  { header: "Run", accessorKey: "id" },
  { header: "Employee", accessorKey: "employee" },
  { header: "Gross", cell: ({ row }) => `$${row.original.grossPay.toLocaleString()}` },
  { header: "Deductions", cell: ({ row }) => `$${row.original.deductions.toLocaleString()}` },
  { header: "Net", cell: ({ row }) => `$${row.original.netPay.toLocaleString()}` },
  { header: "Pay date", accessorKey: "payDate" }
];

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Payroll" subtitle="Compensation and payments" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Next run" description="Scheduled">
          <p className="text-3xl font-semibold">15 Jul</p>
        </Card>
        <Card title="Processing" description="Retro adjustments">
          <p className="text-3xl font-semibold">3</p>
        </Card>
        <Card title="Cost" description="Current month" className="bg-primary/5">
          <p className="text-3xl font-semibold">$1.2M</p>
        </Card>
      </div>
      <Card title="Payroll Runs" description="Recent payroll results">
        <DataTable columns={columns} data={payroll} />
      </Card>
    </div>
  );
}

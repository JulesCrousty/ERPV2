"use client";

import { ColumnDef } from "@tanstack/react-table";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { TimeEntry } from "@/types/hr";

const entries: TimeEntry[] = [
  { id: "T-01", employee: "Marie Curie", date: "2024-07-03", hours: 8, project: "Onboarding" },
  { id: "T-02", employee: "Alan Turing", date: "2024-07-03", hours: 6, project: "Data Lake" },
  { id: "T-03", employee: "Ada Lovelace", date: "2024-07-02", hours: 9, project: "MES" }
];

const columns: ColumnDef<TimeEntry>[] = [
  { header: "Entry", accessorKey: "id" },
  { header: "Employee", accessorKey: "employee" },
  { header: "Date", accessorKey: "date" },
  { header: "Hours", accessorKey: "hours" },
  { header: "Project", accessorKey: "project" }
];

export default function HRTimePage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Time Management" subtitle="Attendance and allocation" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Approved" description="Current week">
          <p className="text-3xl font-semibold">86%</p>
        </Card>
        <Card title="Pending" description="Awaiting manager">
          <p className="text-3xl font-semibold">14</p>
        </Card>
        <Card title="Overtime" description="Hours this month">
          <p className="text-3xl font-semibold">32h</p>
        </Card>
      </div>
      <Card title="Time Entries" description="Recent submissions">
        <DataTable columns={columns} data={entries} />
      </Card>
    </div>
  );
}

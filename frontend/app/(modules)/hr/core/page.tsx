"use client";

import { ColumnDef } from "@tanstack/react-table";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { Employee } from "@/types/hr";
import { Badge } from "@/ui/badge";

const employees: Employee[] = [
  { id: "E-100", name: "Marie Curie", position: "HR Manager", department: "People", status: "Active" },
  { id: "E-120", name: "Alan Turing", position: "Data Scientist", department: "Analytics", status: "On Leave" },
  { id: "E-180", name: "Ada Lovelace", position: "Engineer", department: "Production", status: "Active" }
];

const columns: ColumnDef<Employee>[] = [
  { header: "ID", accessorKey: "id" },
  { header: "Name", accessorKey: "name" },
  { header: "Position", accessorKey: "position" },
  { header: "Dept", accessorKey: "department" },
  { header: "Status", cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge> }
];

export default function HRCorePage() {
  return (
    <div className="space-y-6">
      <PageTitle title="HR Core" subtitle="People and organization" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Headcount" description="Active employees">
          <p className="text-3xl font-semibold">342</p>
        </Card>
        <Card title="New hires" description="Last 30 days">
          <p className="text-3xl font-semibold">8</p>
        </Card>
        <Card title="Attrition" description="YTD">
          <p className="text-3xl font-semibold">4.2%</p>
        </Card>
      </div>
      <Card title="Directory" description="Employees snapshot">
        <DataTable columns={columns} data={employees} />
      </Card>
    </div>
  );
}

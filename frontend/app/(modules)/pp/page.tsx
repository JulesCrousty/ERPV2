"use client";

import { ColumnDef } from "@tanstack/react-table";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { ProductionOrder } from "@/types/pp";
import { Badge } from "@/ui/badge";

const orders: ProductionOrder[] = [
  { id: "PP-3001", material: "Pump Assembly", quantity: 120, status: "Released", startDate: "2024-07-05", endDate: "2024-07-15" },
  { id: "PP-3002", material: "Control Panel", quantity: 60, status: "Scheduled", startDate: "2024-07-08", endDate: "2024-07-20" },
  { id: "PP-3003", material: "Housing", quantity: 220, status: "Delayed", startDate: "2024-06-25", endDate: "2024-07-10" }
];

const columns: ColumnDef<ProductionOrder>[] = [
  { header: "Order", accessorKey: "id" },
  { header: "Material", accessorKey: "material" },
  { header: "Qty", accessorKey: "quantity" },
  {
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>
  },
  { header: "Start", accessorKey: "startDate" },
  { header: "End", accessorKey: "endDate" }
];

export default function PPPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Production Planning" subtitle="Execution and capacity" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Capacity" description="Utilization">
          <p className="text-3xl font-semibold">82%</p>
        </Card>
        <Card title="Shop Floor" description="Active work centers">
          <p className="text-3xl font-semibold">14</p>
        </Card>
        <Card title="Quality" description="Defects / 1k units" className="bg-accent/10">
          <p className="text-3xl font-semibold">1.4</p>
        </Card>
      </div>
      <Card title="Production Orders" description="Running jobs and milestones">
        <DataTable columns={columns} data={orders} />
      </Card>
    </div>
  );
}

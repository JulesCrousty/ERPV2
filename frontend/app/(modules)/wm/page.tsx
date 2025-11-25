"use client";

import { ColumnDef } from "@tanstack/react-table";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { MaterialStock } from "@/types/mm";
import { Badge } from "@/ui/badge";

const movements: MaterialStock[] = [
  { material: "Pallet 1001", plant: "WM01", storageLocation: "BIN-02", quantity: 24, unit: "EA", status: "Available" },
  { material: "Pallet 2003", plant: "WM01", storageLocation: "BIN-05", quantity: 10, unit: "EA", status: "Reserved" },
  { material: "Crate 9012", plant: "WM02", storageLocation: "STAGE-01", quantity: 4, unit: "EA", status: "Blocked" }
];

const columns: ColumnDef<MaterialStock>[] = [
  { header: "Handling Unit", accessorKey: "material" },
  { header: "Warehouse", accessorKey: "plant" },
  { header: "Bin", accessorKey: "storageLocation" },
  { header: "Qty", accessorKey: "quantity" },
  { header: "Unit", accessorKey: "unit" },
  { header: "Status", cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge> }
];

export default function WMPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Warehouse Management" subtitle="Movements and tasks" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Open Tasks" description="Picking & putaway">
          <p className="text-3xl font-semibold">36</p>
        </Card>
        <Card title="Inbound" description="Expected today">
          <p className="text-3xl font-semibold">18</p>
        </Card>
        <Card title="Outbound" description="Shipments" className="bg-primary/5">
          <p className="text-3xl font-semibold">12</p>
        </Card>
      </div>
      <Card title="Handling Units" description="Live warehouse visibility">
        <DataTable columns={columns} data={movements} />
      </Card>
    </div>
  );
}

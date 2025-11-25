"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ShoppingBagIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { MaterialStock } from "@/types/mm";
import { Badge } from "@/ui/badge";

const stock: MaterialStock[] = [
  { material: "Steel Coil", plant: "DE01", storageLocation: "A-01", quantity: 120, unit: "EA", status: "Available" },
  { material: "Fasteners", plant: "DE01", storageLocation: "B-04", quantity: 15, unit: "BOX", status: "Reserved" },
  { material: "Packaging", plant: "US02", storageLocation: "P-02", quantity: 8, unit: "ROLL", status: "Blocked" }
];

const columns: ColumnDef<MaterialStock>[] = [
  { header: "Material", accessorKey: "material" },
  { header: "Plant", accessorKey: "plant" },
  { header: "Storage", accessorKey: "storageLocation" },
  { header: "Qty", accessorKey: "quantity" },
  { header: "Unit", accessorKey: "unit" },
  {
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>
  }
];

export default function MMPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Materials Management" subtitle="Procurement and inventory" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Low stock alerts" description="Critical materials to replenish">
          <div className="flex items-center gap-3 text-2xl font-semibold">
            <ExclamationTriangleIcon className="h-7 w-7 text-amber-500" /> 4
          </div>
        </Card>
        <Card title="Open POs" description="Awaiting confirmation">
          <p className="text-2xl font-semibold">23</p>
        </Card>
        <Card title="Vendors" description="Active" className="bg-primary/5">
          <p className="text-2xl font-semibold">58</p>
        </Card>
      </div>
      <Card title="Stock Overview" description="Latest storage snapshots">
        <DataTable columns={columns} data={stock} />
      </Card>
    </div>
  );
}

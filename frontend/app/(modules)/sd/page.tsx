"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { SalesOrder } from "@/types/sd";
import { Badge } from "@/ui/badge";

const orders: SalesOrder[] = [
  { id: "SO-4501", customer: "Acme Corp", amount: 18200, status: "In Process", expectedDelivery: "2024-07-12" },
  { id: "SO-4502", customer: "Globex", amount: 9800, status: "Completed", expectedDelivery: "2024-06-28" },
  { id: "SO-4503", customer: "Innotech", amount: 15600, status: "Pending", expectedDelivery: "2024-07-20" }
];

const columns: ColumnDef<SalesOrder>[] = [
  { header: "Order", accessorKey: "id" },
  { header: "Customer", accessorKey: "customer" },
  {
    header: "Amount",
    cell: ({ row }) => <span className="font-semibold">${row.original.amount.toLocaleString()}</span>
  },
  {
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>
  },
  { header: "Delivery", accessorKey: "expectedDelivery" }
];

export default function SDPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Sales & Distribution" subtitle="Order to cash" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Pipeline" description="In process">
          <p className="text-3xl font-semibold">$74,800</p>
        </Card>
        <Card title="Fulfillment" description="Ontime ratio">
          <p className="text-3xl font-semibold">96%</p>
        </Card>
        <Card title="Returns" description="This month">
          <p className="text-3xl font-semibold">3</p>
        </Card>
      </div>
      <Card title="Sales Orders" description="Customer pipeline overview">
        <DataTable columns={columns} data={orders} />
      </Card>
    </div>
  );
}

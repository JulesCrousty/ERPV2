"use client";

import { ColumnDef } from "@tanstack/react-table";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { Badge } from "@/ui/badge";
import { useApi } from "@/hooks/useApi";
import { useProtectedRoute } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Loader } from "@/components/loader";

interface SalesOrder {
  id: string;
  customer: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
}

const columns: ColumnDef<SalesOrder>[] = [
  { header: "Order", accessorKey: "id" },
  { header: "Customer", accessorKey: "customer" },
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

export default function SDPage() {
  useProtectedRoute(["admin", "manager"]);
  const salesApi = useApi("/sd/sales-orders");
  const salesOrders = salesApi.list({ limit: 25 });

  return (
    <div className="space-y-6">
      <PageTitle title="Sales & Distribution" subtitle="Quotes, sales orders and billing automation" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Open Orders" description="Pending fulfillment">
          {salesOrders.isLoading ? <Loader /> : <p className="text-2xl font-semibold">{salesOrders.data?.length ?? 0}</p>}
        </Card>
        <Card title="Invoiced" description="Current month" className="bg-primary/5">
          <p className="text-2xl font-semibold">$1.2M</p>
        </Card>
        <Card title="Expedite" description="Urgent deliveries">
          <p className="text-2xl font-semibold">5</p>
        </Card>
      </div>
      {salesOrders.error && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load sales orders</AlertTitle>
          <AlertDescription>{(salesOrders.error as Error).message}</AlertDescription>
        </Alert>
      )}
      <Card title="Sales Orders" description="Latest customer commitments">
        <DataTable columns={columns} data={salesOrders.data ?? []} loading={salesOrders.isLoading} />
      </Card>
    </div>
  );
}

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { QueueListIcon } from "@heroicons/react/24/outline";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { useApi } from "@/hooks/useApi";
import { useProtectedRoute } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Loader } from "@/components/loader";

interface ProductionOrder {
  id: string;
  material: string;
  quantity: number;
  status: string;
  plannedDate: string;
}

const columns: ColumnDef<ProductionOrder>[] = [
  { header: "Order", accessorKey: "id" },
  { header: "Material", accessorKey: "material" },
  { header: "Quantity", accessorKey: "quantity" },
  { header: "Status", accessorKey: "status" },
  { header: "Planned", accessorKey: "plannedDate" }
];

export default function PPPage() {
  useProtectedRoute(["admin", "manager", "employee"]);
  const ordersApi = useApi("/pp/orders");
  const orders = ordersApi.list({ limit: 20 });
  const consumptionApi = useApi("/pp/material-consumption");
  const consumption = consumptionApi.list({ limit: 10 });

  return (
    <div className="space-y-6">
      <PageTitle title="Production Planning" subtitle="Production orders, capacity and shop floor" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Open production orders" description="Scheduled in the next 7 days">
          {orders.isLoading ? <Loader /> : <p className="text-2xl font-semibold">{orders.data?.length ?? 0}</p>}
        </Card>
        <Card title="Material consumption" description="Today" className="bg-primary/5">
          {consumption.isLoading ? <Loader /> : <p className="text-2xl font-semibold">{consumption.data?.length ?? 0}</p>}
        </Card>
        <Card title="Capacity" description="Utilization">
          <div className="flex items-center gap-3 text-2xl font-semibold">
            <QueueListIcon className="h-7 w-7 text-primary" /> 86%
          </div>
        </Card>
      </div>
      {orders.error && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load production orders</AlertTitle>
          <AlertDescription>{(orders.error as Error).message}</AlertDescription>
        </Alert>
      )}
      <Card title="Production Orders" description="Latest shop floor statuses">
        <DataTable columns={columns} data={orders.data ?? []} loading={orders.isLoading} />
      </Card>
    </div>
  );
}

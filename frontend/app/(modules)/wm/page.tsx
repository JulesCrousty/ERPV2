"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CubeIcon, CheckIcon } from "@heroicons/react/24/outline";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { Badge } from "@/ui/badge";
import { useApi } from "@/hooks/useApi";
import { useProtectedRoute } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Button } from "@/ui/button";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "@/components/loader";

interface TransportOrder {
  id: string;
  warehouse: string;
  destination: string;
  status: string;
  priority: string;
}

const columns: ColumnDef<TransportOrder>[] = [
  { header: "Order", accessorKey: "id" },
  { header: "Warehouse", accessorKey: "warehouse" },
  { header: "Destination", accessorKey: "destination" },
  { header: "Status", cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge> },
  { header: "Priority", accessorKey: "priority" }
];

export default function WMPage() {
  useProtectedRoute(["admin", "manager", "employee"]);
  const transportApi = useApi("/wm/transport-orders");
  const transportOrders = transportApi.list({ limit: 25 });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post("/workflow/actions", { action: "APPROVE_TRANSPORT", reference: id }),
    onSuccess: () => transportOrders.refetch()
  });

  return (
    <div className="space-y-6">
      <PageTitle title="Warehouse Management" subtitle="Stock, warehouses and real-time tracking" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Active transport orders" description="Rolling tasks">
          {transportOrders.isLoading ? <Loader /> : <p className="text-2xl font-semibold">{transportOrders.data?.length ?? 0}</p>}
        </Card>
        <Card title="Approvals" description="Workflow integrated" className="bg-primary/5">
          <p className="text-2xl font-semibold">Workflow</p>
        </Card>
        <Card title="Capacity" description="Utilization">
          <div className="flex items-center gap-3 text-2xl font-semibold">
            <CubeIcon className="h-7 w-7 text-primary" /> 78%
          </div>
        </Card>
      </div>
      {transportOrders.error && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load transport orders</AlertTitle>
          <AlertDescription>{(transportOrders.error as Error).message}</AlertDescription>
        </Alert>
      )}
      <Card
        title="Transport Orders"
        description="Execution queue"
        actions={<span className="text-sm text-slate-500">Workflow approvals</span>}
      >
        <DataTable
          columns={columns}
          data={(transportOrders.data ?? []).map((order) => ({ ...order }))}
          loading={transportOrders.isLoading}
          emptyMessage="No transport orders"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {(transportOrders.data ?? []).map((order) => (
            <Button
              key={order.id}
              size="sm"
              variant="outline"
              onClick={() => approveMutation.mutate(order.id)}
              disabled={approveMutation.isLoading}
            >
              <CheckIcon className="h-4 w-4 mr-2" /> Approve {order.id}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
